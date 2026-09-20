<?php

declare(strict_types=1);

// Регистрация маршрутов. $router создаётся в public/index.php и передаётся сюда.

use App\Controllers\AuthController;

/** @var \App\Core\Router $router */

$router->post('/api/v1/auth/register', [AuthController::class, 'register']);
$router->post('/api/v1/auth/login', [AuthController::class, 'login']);
$router->post('/api/v1/auth/refresh', [AuthController::class, 'refresh']);
$router->post('/api/v1/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/v1/auth/me', [AuthController::class, 'me']);
