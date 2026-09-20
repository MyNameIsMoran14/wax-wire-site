<?php

declare(strict_types=1);

namespace App\Core;

class Response
{
    /** @return never */
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /** @return never */
    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }

    /** @return never */
    public static function error(string $code, string $message, int $status = 400): void
    {
        self::json(['error' => ['code' => $code, 'message' => $message]], $status);
    }
}
