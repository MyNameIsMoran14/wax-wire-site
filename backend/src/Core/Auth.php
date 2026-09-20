<?php

declare(strict_types=1);

namespace App\Core;

use App\Models\UserModel;

require_once __DIR__ . '/../Lib/jwtlib.php';

class Auth
{
    private static ?array $currentUser = null;

    public static function issueAccessToken(array $user): string
    {
        $config = require __DIR__ . '/../Config/config.php';

        return jwt_encode([
            'sub' => (int) $user['id'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $config['access_token_ttl'],
        ], $config['jwt_secret']);
    }

    public static function issueRefreshToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function hashRefreshToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function currentUser(Request $request): ?array
    {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        $token = $request->bearerToken();
        if ($token === null) {
            return null;
        }

        $config = require __DIR__ . '/../Config/config.php';
        $payload = jwt_decode($token, $config['jwt_secret']);
        if ($payload === null || !isset($payload['sub'])) {
            return null;
        }

        $user = UserModel::findById((int) $payload['sub']);
        if ($user === null) {
            return null;
        }

        return self::$currentUser = $user;
    }

    /** Требует валидный access token, иначе сразу отвечает 401 и завершает запрос. */
    public static function requireAuth(Request $request): array
    {
        $user = self::currentUser($request);
        if ($user === null) {
            Response::error('unauthorized', 'Требуется авторизация', 401);
        }
        return $user;
    }

    public static function requireRole(Request $request, string $role): array
    {
        $user = self::requireAuth($request);
        if ($user['role'] !== $role) {
            Response::error('forbidden', 'Недостаточно прав', 403);
        }
        return $user;
    }
}
