<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\CartModel;
use App\Models\ProductModel;

class CartController
{
    public function index(Request $request): void
    {
        $user = Auth::requireAuth($request);
        Response::json(CartModel::forUser((int) $user['id']));
    }

    public function store(Request $request): void
    {
        $user = Auth::requireAuth($request);

        $data = $request->all();
        $errors = Validator::validate($data, [
            'product_id' => ['required', 'numeric'],
            'quantity' => ['numeric'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $productId = (int) $data['product_id'];
        $quantity = isset($data['quantity']) ? max(1, (int) $data['quantity']) : 1;

        $product = ProductModel::findById($productId);
        if ($product === null) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }

        $userId = (int) $user['id'];
        $existing = CartModel::findItem($userId, $productId);
        $wantTotal = ($existing !== null ? (int) $existing['quantity'] : 0) + $quantity;
        if ($wantTotal > (int) $product['stock']) {
            Response::error('insufficient_stock', 'Недостаточно товара на складе', 409);
        }

        CartModel::addQuantity($userId, $productId, $quantity);

        Response::json(CartModel::forUser($userId));
    }

    public function update(Request $request, string $productId): void
    {
        $user = Auth::requireAuth($request);
        $userId = (int) $user['id'];

        if (!ctype_digit($productId) || CartModel::findItem($userId, (int) $productId) === null) {
            Response::error('cart_item_not_found', 'Товар не найден в корзине', 404);
        }
        $pid = (int) $productId;

        $data = $request->all();
        $errors = Validator::validate($data, ['quantity' => ['required', 'numeric']]);
        if ($errors !== [] || (int) $data['quantity'] < 1) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $quantity = (int) $data['quantity'];
        $product = ProductModel::findById($pid);
        if ($product !== null && $quantity > (int) $product['stock']) {
            Response::error('insufficient_stock', 'Недостаточно товара на складе', 409);
        }

        CartModel::setQuantity($userId, $pid, $quantity);

        Response::json(CartModel::forUser($userId));
    }

    public function destroy(Request $request, string $productId): void
    {
        $user = Auth::requireAuth($request);
        $userId = (int) $user['id'];

        if (!ctype_digit($productId) || !CartModel::removeItem($userId, (int) $productId)) {
            Response::error('cart_item_not_found', 'Товар не найден в корзине', 404);
        }

        Response::json(CartModel::forUser($userId));
    }
}
