<?php

declare(strict_types=1);

return [
    'db_path' => __DIR__ . '/../../database/vinyl.sqlite',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'dev-secret-change-me',
    'access_token_ttl' => 15 * 60,           // 15 минут
    'refresh_token_ttl' => 30 * 24 * 60 * 60, // 30 дней
    'cors_origin' => getenv('CORS_ORIGIN') ?: 'http://127.0.0.1:5173',
];
