<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\RefreshTokenModel;
use App\Models\UserModel;

class AuthController
{
    private const REFRESH_COOKIE = 'refresh_token';
    private const REFRESH_TTL_DAYS = 30;
    // A valid-format bcrypt hash of an unguessable string nobody could ever type
    // as a password. Used to keep password_verify()'s cost constant when the
    // email doesn't exist, so "no such user" and "wrong password" take the same time.
    private const DUMMY_PASSWORD_HASH = '$2y$10$eImiTXuWVxfM37uY4JANjQZ8Z1p6c7v3l4XW9k1r2q3s4t5u6v7w8';

    public function register(Request $request): void
    {
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

    public function refresh(Request $request): void
    {
        $token = $request->cookie(self::REFRESH_COOKIE);
        if ($token === null) {
            Response::error('unauthorized', 'Нет refresh-токена', 401);
        }

        $stored = RefreshTokenModel::findValid(Auth::hashRefreshToken($token));
        if ($stored === null) {
            Response::error('unauthorized', 'Refresh-токен недействителен', 401);
        }

        // Ротация: старый токен гасим, выдаём новый — чтобы украденный старый
        // токен нельзя было переиспользовать повторно.
        RefreshTokenModel::revoke(Auth::hashRefreshToken($token));
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
}
