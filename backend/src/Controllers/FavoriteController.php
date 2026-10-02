<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\FavoriteModel;
use App\Models\ProductModel;

class FavoriteController
{
    public function index(Request $request): void
    {
        $user = Auth::requireAuth($request);
        Response::json(FavoriteModel::forUser((int) $user['id']));
    }

    public function store(Request $request, string $productId): void
    {
        $user = Auth::requireAuth($request);

        if (!ctype_digit($productId) || ProductModel::findById((int) $productId) === null) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }

        FavoriteModel::add((int) $user['id'], (int) $productId);
        Response::noContent();
    }

    public function destroy(Request $request, string $productId): void
    {
        $user = Auth::requireAuth($request);

        if (!ctype_digit($productId) || !FavoriteModel::remove((int) $user['id'], (int) $productId)) {
            Response::error('not_found', 'Товар не в избранном', 404);
        }

        Response::noContent();
    }
}
