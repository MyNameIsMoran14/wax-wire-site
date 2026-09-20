<?php

declare(strict_types=1);

// Единственная точка входа. Все запросы прилетают сюда через .htaccess.

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

use App\Core\Request;
use App\Core\Router;

$config = require __DIR__ . '/../src/Config/config.php';

// Access-Control-Allow-Origin с credentials:true обязан быть точным origin,
// а не '*'. Vite при занятом 5173 сам уезжает на 5174/5175 и т.д., так что
// вместо одного захардкоженного порта разрешаем localhost/127.0.0.1 на любом
// порту в dev — и берём точный origin из конфига как fallback (для prod).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isLocalDev = (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
header('Access-Control-Allow-Origin: ' . ($isLocalDev ? $origin : $config['cors_origin']));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

// Preflight-запрос браузера — сразу отвечаем, дальше в роутер не идём.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$request = new Request();
$router = new Router();

require __DIR__ . '/../src/routes.php';

$router->dispatch($request);
