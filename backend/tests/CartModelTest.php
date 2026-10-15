<?php

declare(strict_types=1);

use App\Models\CartModel;

test('addQuantity creates a new row for a product not yet in the cart', function () {
    $userId = makeUser('cart1@test.local');
    $productId = makeProduct(stock: 10);

    CartModel::addQuantity($userId, $productId, 3);

    $item = CartModel::findItem($userId, $productId);
    assertSame(3, (int) $item['quantity']);
});

test('addQuantity merges into the existing row instead of duplicating it', function () {
    $userId = makeUser('cart2@test.local');
    $productId = makeProduct(stock: 10);

    CartModel::addQuantity($userId, $productId, 2);
    CartModel::addQuantity($userId, $productId, 3);

    $item = CartModel::findItem($userId, $productId);
    assertSame(5, (int) $item['quantity'], 'quantities accumulate');

    $rowCount = App\Core\Database::table('cart_items')->where('user_id', $userId)->where('product_id', $productId)->count();
    assertSame(1, $rowCount, 'still a single row, not one per call — UNIQUE(user_id, product_id) holds');
});

test('setQuantity overwrites rather than adding', function () {
    $userId = makeUser('cart3@test.local');
    $productId = makeProduct(stock: 10);

    CartModel::addQuantity($userId, $productId, 5);
    CartModel::setQuantity($userId, $productId, 1);

    $item = CartModel::findItem($userId, $productId);
    assertSame(1, (int) $item['quantity']);
});

test('removeItem deletes the row and reports success', function () {
    $userId = makeUser('cart4@test.local');
    $productId = makeProduct(stock: 10);

    CartModel::addQuantity($userId, $productId, 1);
    $removed = CartModel::removeItem($userId, $productId);

    assertTrue($removed);
    assertSame(null, CartModel::findItem($userId, $productId));
});

test('removeItem on a non-existent row reports no-op, not an error', function () {
    $userId = makeUser('cart5@test.local');
    $productId = makeProduct(stock: 10);

    $removed = CartModel::removeItem($userId, $productId);

    assertSame(false, $removed);
});

test('carts for different users with the same product stay independent', function () {
    $userA = makeUser('cartA@test.local');
    $userB = makeUser('cartB@test.local');
    $productId = makeProduct(stock: 10);

    CartModel::addQuantity($userA, $productId, 2);
    CartModel::addQuantity($userB, $productId, 7);

    assertSame(2, (int) CartModel::findItem($userA, $productId)['quantity']);
    assertSame(7, (int) CartModel::findItem($userB, $productId)['quantity']);
});
