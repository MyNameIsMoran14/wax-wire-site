<?php

declare(strict_types=1);

// Prefer an explicit JWT_SECRET env var (required for a real deployment).
// Otherwise generate a random one on first run and persist it to disk, so
// there's never a hardcoded/guessable fallback secret — every install gets
// its own, and tokens stay valid across requests without needing setup.
function resolve_jwt_secret(): string
{
    $envSecret = getenv('JWT_SECRET');
    if ($envSecret !== false && $envSecret !== '') {
        return $envSecret;
    }

    $keyFile = __DIR__ . '/../../storage/jwt_secret.key';
    if (is_file($keyFile)) {
        $existing = trim((string) file_get_contents($keyFile));
        if ($existing !== '') {
            return $existing;
        }
    }

    if (!is_dir(dirname($keyFile))) {
        mkdir(dirname($keyFile), 0777, true);
    }
    $secret = bin2hex(random_bytes(32));
    file_put_contents($keyFile, $secret);
    return $secret;
}

return [
    'db_path' => __DIR__ . '/../../database/vinyl.sqlite',
    'jwt_secret' => resolve_jwt_secret(),
    'access_token_ttl' => 15 * 60,           // 15 минут
    'refresh_token_ttl' => 30 * 24 * 60 * 60, // 30 дней
    'cors_origin' => getenv('CORS_ORIGIN') ?: 'http://127.0.0.1:5173',
];
