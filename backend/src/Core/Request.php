<?php

declare(strict_types=1);

namespace App\Core;

class Request
{
    public readonly string $method;
    public readonly string $path;
    private readonly array $body;
    private readonly array $query;
    private readonly array $headers;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $this->path = $uri === '/' ? '/' : rtrim($uri, '/');

        $this->query = $_GET;

        $raw = (string) file_get_contents('php://input');
        $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '', 2)[0]));
        $body = [];
        if ($raw !== '' && in_array($contentType, ['', 'application/json'], true)) {
            $body = json_decode($raw, true);
            if (!is_array($body) || !str_starts_with(ltrim($raw), '{')) {
                Response::error('invalid_request_body', 'Ожидается корректный JSON-объект', 400);
            }
        }
        $this->body = $body;
        $this->headers = function_exists('getallheaders') ? (getallheaders() ?: []) : [];
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function all(): array
    {
        return $this->body;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $header = $this->headers['Authorization'] ?? $this->headers['authorization'] ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }

    public function cookie(string $key): ?string
    {
        return $_COOKIE[$key] ?? null;
    }

    /**
     * A single uploaded file from a multipart/form-data request, in PHP's
     * native $_FILES shape (name/type/tmp_name/error/size). Not parsed from
     * php://input — PHP consumes multipart bodies into $_FILES itself.
     */
    public function file(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }
}
