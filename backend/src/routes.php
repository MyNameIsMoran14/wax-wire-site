<?php

declare(strict_types=1);

// Регистрация маршрутов. $router создаётся в public/index.php и передаётся сюда.

use App\Controllers\Admin\GenreController as AdminGenreController;
use App\Controllers\Admin\ProductController as AdminProductController;
use App\Controllers\AuthController;
use App\Controllers\GenreController;
use App\Controllers\ProductController;

/** @var \App\Core\Router $router */

$router->post('/api/v1/auth/register', [AuthController::class, 'register']);
$router->post('/api/v1/auth/login', [AuthController::class, 'login']);
$router->post('/api/v1/auth/refresh', [AuthController::class, 'refresh']);
$router->post('/api/v1/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/v1/auth/me', [AuthController::class, 'me']);

$router->get('/api/v1/genres', [GenreController::class, 'index']);
$router->get('/api/v1/products', [ProductController::class, 'index']);
$router->get('/api/v1/products/{id}', [ProductController::class, 'show']);

$router->get('/api/v1/admin/products', [AdminProductController::class, 'index']);
$router->post('/api/v1/admin/products', [AdminProductController::class, 'store']);
$router->patch('/api/v1/admin/products/{id}', [AdminProductController::class, 'update']);
$router->delete('/api/v1/admin/products/{id}', [AdminProductController::class, 'destroy']);
$router->post('/api/v1/admin/products/{id}/image', [AdminProductController::class, 'uploadImage']);

$router->get('/api/v1/admin/genres', [AdminGenreController::class, 'index']);
$router->post('/api/v1/admin/genres', [AdminGenreController::class, 'store']);
$router->patch('/api/v1/admin/genres/{id}', [AdminGenreController::class, 'update']);
$router->delete('/api/v1/admin/genres/{id}', [AdminGenreController::class, 'destroy']);
