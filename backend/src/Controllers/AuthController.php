<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\CodeMailer;
use App\Core\RateLimiter;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\RefreshTokenModel;
use App\Models\UserModel;

class AuthController
{
    private const REFRESH_COOKIE = 'refresh_token';
    private const REFRESH_TTL_DAYS = 30;
    // How long after a token's rotation a "this token is already revoked"
    // sighting is still chalked up to an ordinary multi-tab race rather than
    // treated as proof of theft. Real attackers replay stolen tokens well
    // after the fact, not within the same instant as the legitimate rotation.
    private const REUSE_GRACE_SECONDS = 5;
    // A valid-format bcrypt hash of an unguessable string nobody could ever type
    // as a password. Used to keep password_verify()'s cost constant when the
    // email doesn't exist, so "no such user" and "wrong password" take the same time.
    private const DUMMY_PASSWORD_HASH = '$2y$10$eImiTXuWVxfM37uY4JANjQZ8Z1p6c7v3l4XW9k1r2q3s4t5u6v7w8';

    public function register(Request $request): void
    {
        $this->enforceRateLimit('register', maxAttempts: 5, windowSeconds: 60);

        $data = $request->all();

        $errors = Validator::validate($data, [
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8'],
            'name' => ['required'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        if (UserModel::findByEmail($data['email']) !== null) {
            Response::error('email_taken', 'Этот email уже зарегистрирован', 409);
        }

        $userId = UserModel::create(
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['name'],
        );

        $this->respondWithSession(UserModel::findById($userId), 201);
    }

    public function login(Request $request): void
    {
        $this->enforceRateLimit('login', maxAttempts: 10, windowSeconds: 60);

        $data = $request->all();

        $errors = Validator::validate($data, [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $user = UserModel::findByEmail($data['email']);
        // Always run password_verify, even for an unknown email — otherwise
        // "no such user" short-circuits and returns measurably faster than
        // "wrong password", letting an attacker enumerate registered emails
        // by timing the response.
        $hashToCheck = $user['password_hash'] ?? self::DUMMY_PASSWORD_HASH;
        $passwordOk = password_verify($data['password'], $hashToCheck);
        if ($user === null || !$passwordOk) {
            Response::error('invalid_credentials', 'Неверный email или пароль', 401);
        }

        $this->respondWithSession($user, 200);
    }

    public function requestEmailCode(Request $request): void
    {
        $email = $request->input('email');
        if (!is_string($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('validation_error', 'Введите корректный email', 400);
        }
        $email = mb_strtolower(trim($email));
        $this->enforceRateLimit('email_code', 5, 600);
        $pdo = Database::connection();
        $id = bin2hex(random_bytes(24));
        $code = (string) random_int(100000, 999999);
        $hash = hash_hmac('sha256', $id . ':' . $code, \App\Core\Config::get()['jwt_secret']);
        // Reserve the email while sending, so concurrent requests cannot send twice.
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $pdo->prepare('DELETE FROM email_login_codes WHERE expires_at <= ?')->execute([time()]);
            $stmt = $pdo->prepare('SELECT MAX(expires_at) FROM email_login_codes WHERE email = ?');
            $stmt->execute([$email]);
            $retryAfter = max(0, (int) $stmt->fetchColumn() - time() - 540);
            if ($retryAfter > 0) {
                $pdo->exec('COMMIT');
                header('Retry-After: ' . $retryAfter);
                Response::json(['error' => [
                    'code' => 'rate_limit_exceeded',
                    'message' => 'Повторная отправка доступна через ' . $retryAfter . ' сек.',
                    'retry_after' => $retryAfter,
                ]], 429);
            }
            $pdo->prepare('INSERT INTO email_login_codes (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)')
                ->execute([$id, $email, $hash, time() + 600]);
            $pdo->exec('COMMIT');
        } catch (\Throwable $e) {
            $pdo->exec('ROLLBACK');
            throw $e;
        }
        try {
            CodeMailer::send($email, $code);
        } catch (\Throwable $e) {
            $pdo->prepare('DELETE FROM email_login_codes WHERE id = ?')->execute([$id]);
            error_log('Email login delivery failed: ' . $e->getMessage());
            Response::error('mail_unavailable', 'Не удалось отправить письмо. Попробуйте позже', 503);
        }
        // Keep the newest request only after its delivery succeeds.
        $pdo->prepare('DELETE FROM email_login_codes WHERE email = ? AND id != ?')->execute([$email, $id]);
        Response::json(['challenge_id' => $id, 'expires_in' => 600, 'resend_after' => 60]);
    }

    public function verifyEmailCode(Request $request): void
    {
        $id = $request->input('challenge_id');
        $code = $request->input('code');
        if (!is_string($id) || !preg_match('/^[a-f0-9]{48}$/D', $id)
            || !is_string($code) || !preg_match('/^[0-9]{6}$/D', $code)) {
            Response::error('validation_error', 'Введите шестизначный код', 400);
        }
        $this->enforceRateLimit('verify_email_code', 30, 600);
        $pdo = Database::connection();
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $stmt = $pdo->prepare('SELECT * FROM email_login_codes WHERE id = ?');
            $stmt->execute([$id]);
            $challenge = $stmt->fetch();
            $valid = $challenge && (int) $challenge['expires_at'] > time()
                && (int) $challenge['attempts'] < 5;
            if ($valid) {
                $pdo->prepare('UPDATE email_login_codes SET attempts = attempts + 1 WHERE id = ?')->execute([$id]);
                $hash = hash_hmac('sha256', $id . ':' . $code, \App\Core\Config::get()['jwt_secret']);
                $valid = hash_equals($challenge['code_hash'], $hash);
            }
            if (!$valid) {
                $pdo->exec('COMMIT');
                Response::error('invalid_code', 'Код неверен или истёк. Запросите новый код', 400);
            }
            $user = UserModel::findByEmail($challenge['email']);
            if ($user === null) {
                $userId = UserModel::create(
                    $challenge['email'],
                    password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT),
                    explode('@', $challenge['email'], 2)[0],
                );
                $user = UserModel::findById($userId);
            }
            $pdo->prepare('DELETE FROM email_login_codes WHERE id = ?')->execute([$id]);
            $pdo->exec('COMMIT');
        } catch (\Throwable $e) {
            $pdo->exec('ROLLBACK');
            throw $e;
        }
        $this->respondWithSession($user, 200);
    }

    public function googleStart(Request $request): void
    {
        try {
            $url = \App\Core\GoogleOAuth::authorizationUrl();
        } catch (\Throwable $error) {
            $this->googleRedirect('google_not_configured');
        }
        header('Cache-Control: no-store');
        header('Referrer-Policy: no-referrer');
        header('Location: ' . $url, true, 302);
        exit;
    }

    public function googleCallback(Request $request): void
    {
        try {
            $claims = \App\Core\GoogleOAuth::authenticate($request);
            $user = UserModel::findOrCreateGoogleUser($claims);
            $this->setRefreshCookie($this->issueAndStoreRefreshToken((int) $user['id']));
        } catch (\Throwable $error) {
            $knownErrors = ['google_invalid_state', 'google_cancelled', 'google_email_link_required'];
            $code = in_array($error->getMessage(), $knownErrors, true) ? $error->getMessage() : 'google_unavailable';
            $this->googleRedirect($code);
        }
        $this->googleRedirect();
    }

    private function googleRedirect(?string $error = null): never
    {
        $frontend = rtrim(\App\Core\GoogleOAuth::config()['frontend_url'], '/');
        $path = $error === null ? '/profile' : '/login?google_error=' . rawurlencode($error);
        header('Cache-Control: no-store');
        header('Referrer-Policy: no-referrer');
        header('Location: ' . $frontend . $path, true, 302);
        exit;
    }

    public function refresh(Request $request): void
    {
        $token = $request->cookie(self::REFRESH_COOKIE);
        if ($token === null) {
            Response::error('unauthorized', 'Нет refresh-токена', 401);
        }

        $hash = Auth::hashRefreshToken($token);
        $stored = RefreshTokenModel::findByHash($hash);

        if ($stored === null) {
            Response::error('unauthorized', 'Refresh-токен недействителен', 401);
        }

        if ($stored['revoked_at'] !== null) {
            // This exact token was already rotated away once before — but
            // "already revoked" alone doesn't prove theft. A single-threaded
            // dev server processes requests one at a time, so two browser
            // tabs reloading at once produce exactly this: tab A's request
            // runs first and rotates the token, then tab B's request (sent
            // at basically the same moment, using the now-stale cookie) sees
            // it as already-revoked purely because it got processed second.
            // Nuking every session here would kill tab A's brand-new token
            // along with it. A short grace window tells the two apart: a
            // real thief replaying a stolen token does so well after the
            // legitimate rotation, not within the same instant.
            $revokedSecondsAgo = time() - strtotime($stored['revoked_at']);
            if ($revokedSecondsAgo > self::REUSE_GRACE_SECONDS) {
                RefreshTokenModel::revokeAllForUser((int) $stored['user_id']);
                Response::error('unauthorized', 'Обнаружено повторное использование токена — все сессии завершены', 401);
            }
            Response::error('unauthorized', 'Токен уже обновлён в другом месте — попробуйте ещё раз', 401);
        }

        if (strtotime($stored['expires_at']) <= time()) {
            Response::error('unauthorized', 'Refresh-токен истёк', 401);
        }

        // Ротация: старый токен гасим, выдаём новый — чтобы украденный старый
        // токен нельзя было переиспользовать повторно. revokeIfActive — это
        // атомарный "claim": если тот же токен одновременно пришёл из двух
        // мест (две вкладки, либо ворованная копия), выиграть может только
        // один запрос — проверка "не отозван ли" и сам отзыв это одна SQL-операция,
        // а не два отдельных шага с окном для гонки между ними.
        if (!RefreshTokenModel::revokeIfActive($hash)) {
            // Проиграли гонку — кто-то другой отозвал этот токен долю секунды
            // назад. Сам по себе этот случай не доказывает кражу (две вкладки,
            // перезагруженные одновременно, устроят ровно такую же гонку) —
            // раньше здесь стоял revokeAllForUser(), но он мог убить и
            // СВЕЖИЙ токен победителя, если его INSERT успевал раньше нашего
            // UPDATE: невиновный мультивкладочный юзер вылетал отовсюду с
            // ложным "кража обнаружена". Настоящая кража (повторное предъявление
            // уже мёртвого токена) ловится проверкой revoked_at выше и там
            // revokeAllForUser остаётся — это и есть однозначный сигнал.
            Response::error('unauthorized', 'Токен уже обновлён в другом месте — попробуйте ещё раз', 401);
        }

        $user = UserModel::findById((int) $stored['user_id']);

        $this->setRefreshCookie($this->issueAndStoreRefreshToken((int) $user['id']));

        Response::json(['accessToken' => Auth::issueAccessToken($user)]);
    }

    public function logout(Request $request): void
    {
        Auth::requireAuth($request);

        $token = $request->cookie(self::REFRESH_COOKIE);
        if ($token !== null) {
            RefreshTokenModel::revoke(Auth::hashRefreshToken($token));
        }

        setcookie(self::REFRESH_COOKIE, '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        Response::noContent();
    }

    public function me(Request $request): void
    {
        $user = Auth::requireAuth($request);
        Response::json(['user' => UserModel::toPublic($user)]);
    }

    public function updateProfile(Request $request): void
    {
        $user = Auth::requireAuth($request);
        $data = $request->all();

        $errors = Validator::validate($data, [
            'name' => ['required'],
            'email' => ['required', 'email'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $existing = UserModel::findByEmail($data['email']);
        if ($existing !== null && (int) $existing['id'] !== (int) $user['id']) {
            Response::error('email_taken', 'Этот email уже зарегистрирован', 409);
        }

        UserModel::updateProfile((int) $user['id'], (string) $data['name'], (string) $data['email']);

        Response::json(['user' => UserModel::toPublic(UserModel::findById((int) $user['id']))]);
    }

    public function updatePassword(Request $request): void
    {
        $user = Auth::requireAuth($request);
        $data = $request->all();

        $errors = Validator::validate($data, [
            'current_password' => ['required'],
            'new_password' => ['required', 'min:8'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        if (!password_verify((string) $data['current_password'], $user['password_hash'])) {
            Response::error('invalid_credentials', 'Неверный текущий пароль', 401);
        }

        UserModel::updatePassword((int) $user['id'], password_hash((string) $data['new_password'], PASSWORD_DEFAULT));

        Response::noContent();
    }

    private function respondWithSession(array $user, int $status): void
    {
        $this->setRefreshCookie($this->issueAndStoreRefreshToken((int) $user['id']));

        Response::json([
            'user' => UserModel::toPublic($user),
            'accessToken' => Auth::issueAccessToken($user),
        ], $status);
    }

    private function issueAndStoreRefreshToken(int $userId): string
    {
        $token = Auth::issueRefreshToken();

        RefreshTokenModel::create(
            $userId,
            Auth::hashRefreshToken($token),
            date('c', time() + self::REFRESH_TTL_DAYS * 86400),
        );

        return $token;
    }

    private function setRefreshCookie(string $token): void
    {
        setcookie(self::REFRESH_COOKIE, $token, [
            'expires' => time() + self::REFRESH_TTL_DAYS * 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            // 'secure' => true, // включить, когда будет HTTPS
        ]);
    }

    // IP-scoped brute-force guard for register/login. Keyed by action so a
    // burst of registrations doesn't also lock out logins from the same IP.
    private function enforceRateLimit(string $action, int $maxAttempts, int $windowSeconds): void
    {
        // Note: trusts REMOTE_ADDR as-is, so behind a reverse proxy every
        // client would share one bucket (the proxy's IP) unless the proxy is
        // configured to set — and this app is made to trust — a real client
        // IP header. No such setup here, so left as REMOTE_ADDR: correct for
        // direct access (how this project actually runs), the proxy case is
        // out of scope until there's an actual deployment target to match.
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = "{$action}:{$ip}";

        if (RateLimiter::hit($key, $maxAttempts, $windowSeconds)) {
            Response::error('rate_limit_exceeded', 'Слишком много попыток, попробуйте позже', 429);
        }
    }
}
