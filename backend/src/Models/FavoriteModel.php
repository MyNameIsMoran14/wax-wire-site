<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class FavoriteModel
{
    /** @return list<array> Product rows, shaped via ProductModel::rowToPublic() */
    public static function forUser(int $userId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT p.*, g.id AS joined_genre_id, g.name AS joined_genre_name
             FROM favorites f
             JOIN products p ON p.id = f.product_id
             LEFT JOIN genres g ON g.id = p.genre_id
             WHERE f.user_id = ?
             ORDER BY f.id DESC',
        );
        $stmt->execute([$userId]);
        return array_map([ProductModel::class, 'rowToPublic'], $stmt->fetchAll());
    }

    // INSERT OR IGNORE — favoriting something twice is a no-op, not an
    // error (the UNIQUE(user_id, product_id) constraint would otherwise throw).
    public static function add(int $userId, int $productId): void
    {
        $stmt = Database::connection()->prepare(
            'INSERT OR IGNORE INTO favorites (user_id, product_id, created_at) VALUES (?, ?, ?)',
        );
        $stmt->execute([$userId, $productId, date('c')]);
    }

    public static function remove(int $userId, int $productId): bool
    {
        return Database::table('favorites')->where('user_id', $userId)->where('product_id', $productId)->delete() > 0;
    }
}
