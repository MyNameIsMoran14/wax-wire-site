<?php

declare(strict_types=1);

namespace App\Core;

// Список маршрутов + диспетчер. Никакой автозагрузки роутов рефлексией —
// каждый маршрут регистрируется явно в routes.php.
class Router
{
    /** @var list<array{0: string, 1: string, 2: array{0: class-string, 1: string}}> */
    private array $routes = [];

    public function get(string $pattern, array $handler): void
    {
        $this->routes[] = ['GET', $pattern, $handler];
    }

    public function post(string $pattern, array $handler): void
    {
        $this->routes[] = ['POST', $pattern, $handler];
    }

    public function patch(string $pattern, array $handler): void
    {
        $this->routes[] = ['PATCH', $pattern, $handler];
    }

    public function delete(string $pattern, array $handler): void
    {
        $this->routes[] = ['DELETE', $pattern, $handler];
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->routes as [$method, $pattern, $handler]) {
            if ($method !== $request->method) {
                continue;
            }

            $regex = '#^' . preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', $pattern) . '$#';

            if (preg_match($regex, $request->path, $matches)) {
                array_shift($matches);
                [$class, $action] = $handler;
                (new $class())->$action($request, ...$matches);
                return;
            }
        }

        Response::error('not_found', 'Маршрут не найден', 404);
    }
}
