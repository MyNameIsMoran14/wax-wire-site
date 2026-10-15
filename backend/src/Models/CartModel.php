<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class CartModel
{
    // Raw SQL for the join (QueryBuilder has no JOIN support), reusing
    // ProductModel::rowToPublic() for the embedded product so the shape
    // matches the catalog exactly.
    /** @return array{items: list<array{product: array, quantity: int}>, total: string} */
    public static function forUser(int $userId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT p.*, g.id AS joined_genre_id, g.name AS joined_genre_name, ci.quantity
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             LEFT JOIN genres g ON g.id = p.genre_id
             WHERE ci.user_id = ?
             ORDER BY ci.id DESC',
        );
        $stmt->execute([$userId]);

        $items = [];
        $total = 0.0;
        foreach ($stmt->fetchAll() as $row) {
            $quantity = (int) $row['quantity'];
            $product = ProductModel::rowToPublic($row);
            $items[] = ['product' => $product, 'quantity' => $quantity];
            $total += (float) $product['price'] * $quantity;
        }

        return ['items' => $items, 'total' => number_format($total, 2, '.', '')];
    }

    public static function findItem(int $userId, int $productId): ?array
    {
        return Database::table('cart_items')->where('user_id', $userId)->where('product_id', $productId)->first();
    }

    // POST /cart/items adds to whatever quantity is already there (the usual
    // "add to cart" behavior) — PATCH is the explicit "set to this amount" path.
    public static function addQuantity(int $userId, int $productId, int $quantity): void
    {
        $existing = self::findItem($userId, $productId);
        if ($existing !== null) {
            Database::table('cart_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->update(['quantity' => (int) $existing['quantity'] + $quantity]);
            return;
        }

        Database::table('cart_items')->insert([
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'created_at' => date('c'),
        ]);
    }

    public static function setQuantity(int $userId, int $productId, int $quantity): bool
    {
        return Database::table('cart_items')
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->update(['quantity' => $quantity]) > 0;
    }

    public static function removeItem(int $userId, int $productId): bool
    {
        return Database::table('cart_items')
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete() > 0;
    }
}
