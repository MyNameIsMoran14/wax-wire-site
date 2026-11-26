<?php

declare(strict_types=1);

use App\Models\CheckoutException;
use App\Models\OrderModel;

test('cancelling a new order restores stock for every item', function () {
    $userId = makeUser('cancel1@test.local');
    $productId = makeProduct(stock: 5);
    $orderId = makeOrder($userId, 'new', [[$productId, 2]]);

    OrderModel::updateStatus($orderId, 'cancelled');

    assertSame(7, stockOf($productId), 'stock after cancel');
});

test('cancelling the same order twice only restores stock once (idempotent)', function () {
    $userId = makeUser('cancel2@test.local');
    $productId = makeProduct(stock: 5);
    $orderId = makeOrder($userId, 'new', [[$productId, 2]]);

    OrderModel::updateStatus($orderId, 'cancelled');
    OrderModel::updateStatus($orderId, 'cancelled');

    assertSame(7, stockOf($productId), 'stock stays at 5+2, not 5+2+2');
});

test('un-cancelling an order reclaims stock when enough is available', function () {
    $userId = makeUser('uncancel1@test.local');
    $productId = makeProduct(stock: 5);
    $orderId = makeOrder($userId, 'cancelled', [[$productId, 2]]);

    $ok = OrderModel::updateStatus($orderId, 'processing');

    assertTrue($ok, 'updateStatus returns true');
    assertSame(3, stockOf($productId), 'stock claimed back on un-cancel');
});

test('un-cancelling fails with insufficient_stock when stock was sold elsewhere, and rolls back', function () {
    $userId = makeUser('uncancel2@test.local');
    $productId = makeProduct(stock: 1); // order wants 2, only 1 left
    $orderId = makeOrder($userId, 'cancelled', [[$productId, 2]]);

    $threw = false;
    try {
        OrderModel::updateStatus($orderId, 'processing');
    } catch (CheckoutException $e) {
        $threw = true;
        assertSame('insufficient_stock', $e->errorCode);
    }

    assertTrue($threw, 'expected CheckoutException');
    assertSame(1, stockOf($productId), 'stock untouched after failed reclaim');

    $order = App\Core\Database::table('orders')->where('id', $orderId)->first();
    assertSame('cancelled', $order['status'], 'order status unchanged on rollback');
});

test('changing status between two non-cancelled states does not touch stock', function () {
    $userId = makeUser('transition1@test.local');
    $productId = makeProduct(stock: 5);
    $orderId = makeOrder($userId, 'new', [[$productId, 2]]);

    OrderModel::updateStatus($orderId, 'processing');
    OrderModel::updateStatus($orderId, 'shipped');

    assertSame(5, stockOf($productId), 'stock untouched for non-cancel transitions');
});

test('updateStatus returns false for a non-existent order', function () {
    $ok = OrderModel::updateStatus(999999, 'processing');
    assertSame(false, $ok);
});

test('order_items with a deleted product (NULL product_id) are skipped, not fatal', function () {
    $userId = makeUser('nullproduct@test.local');
    $orderId = makeOrder($userId, 'new', [[null, 2]]);

    $ok = OrderModel::updateStatus($orderId, 'cancelled');

    assertTrue($ok, 'cancelling an order with a deleted product line item still succeeds');
});
