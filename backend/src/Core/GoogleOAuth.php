<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

class GoogleOAuth
{
    public static function config(): array
    {
        $local = __DIR__ . '/../Config/google.local.php';
        return [
            'client_id' => getenv('GOOGLE_CLIENT_ID') ?: '',
            'client_secret' => getenv('GOOGLE_CLIENT_SECRET') ?: '',
            'redirect_uri' => 'http://127.0.0.1:8181/api/v1/auth/google/callback',
            'frontend_url' => 'http://127.0.0.1:5183',
            ...(is_file($local) ? require $local : []),
        ];
    }

    public static function authorizationUrl(): string
    {
        $config = self::config();
        if ($config['client_id'] === '' || $config['client_secret'] === '') {
            throw new RuntimeException('google_not_configured');
        }
        self::openSession();
        $state = bin2hex(random_bytes(32));
        $nonce = bin2hex(random_bytes(32));
        $verifier = bin2hex(random_bytes(32));
        $_SESSION['google_login'] = [
            'state' => $state, 'nonce' => $nonce, 'verifier' => $verifier, 'expires_at' => time() + 600,
        ];
        session_write_close();
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => $config['client_id'],
            'redirect_uri' => $config['redirect_uri'],
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'nonce' => $nonce,
            'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
            'code_challenge_method' => 'S256',
            'prompt' => 'select_account',
        ], '', '&', PHP_QUERY_RFC3986);
    }

    public static function authenticate(Request $request): array
    {
        self::openSession();
        $login = $_SESSION['google_login'] ?? null;
        unset($_SESSION['google_login']);
        session_write_close();
        $state = $request->query('state');
        if (!is_array($login) || $login['expires_at'] <= time()
            || !is_string($state) || !hash_equals($login['state'], $state)) {
            throw new RuntimeException('google_invalid_state');
        }
        if ($request->query('error') !== null) {
            throw new RuntimeException('google_cancelled');
        }
        $code = $request->query('code');
        if (!is_string($code) || $code === '') {
            throw new RuntimeException('google_invalid_response');
        }
        $config = self::config();
        $tokens = self::exchangeCode([
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'redirect_uri' => $config['redirect_uri'],
            'grant_type' => 'authorization_code',
            'code' => $code,
            'code_verifier' => $login['verifier'],
        ]);
        // This ID token comes directly from Google's token endpoint over verified TLS.
        // It is never accepted from the browser or another untrusted caller.
        $parts = explode('.', $tokens['id_token'] ?? '');
        if (count($parts) !== 3) {
            throw new RuntimeException('google_invalid_response');
        }
        $payload = strtr($parts[1], '-_', '+/');
        $payload = base64_decode(str_pad($payload, (int) (ceil(strlen($payload) / 4) * 4), '='), true);
        $claims = json_decode($payload ?: '', true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($claims) || ($claims['aud'] ?? null) !== $config['client_id']
            || !in_array($claims['iss'] ?? null, ['https://accounts.google.com', 'accounts.google.com'], true)
            || !is_numeric($claims['exp'] ?? null) || $claims['exp'] <= time()
            || !is_string($claims['nonce'] ?? null) || !hash_equals($login['nonce'], $claims['nonce'])
            || !is_string($claims['sub'] ?? null) || $claims['sub'] === ''
            || !is_string($claims['email'] ?? null) || !filter_var($claims['email'], FILTER_VALIDATE_EMAIL)
            || !in_array($claims['email_verified'] ?? null, [true, 'true'], true)) {
            throw new RuntimeException('google_invalid_response');
        }
        return $claims;
    }

    private static function openSession(): void
    {
        session_name('wax_google_login');
        session_set_cookie_params([
            'path' => '/api/v1/auth/google',
            'httponly' => true,
            'secure' => str_starts_with(self::config()['redirect_uri'], 'https://'),
            'samesite' => 'Lax',
        ]);
        if (!session_start()) {
            throw new RuntimeException('google_unavailable');
        }
    }

    private static function exchangeCode(array $parameters): array
    {
        $curl = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($parameters),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        try {
            $response = curl_exec($curl);
            if ($response === false || curl_getinfo($curl, CURLINFO_RESPONSE_CODE) !== 200) {
                throw new RuntimeException('google_unavailable');
            }
            $tokens = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($tokens)) {
                throw new RuntimeException('google_invalid_response');
            }
            return $tokens;
        } finally {
            curl_close($curl);
        }
    }
}
