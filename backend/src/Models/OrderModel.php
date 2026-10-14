<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use Throwable;

class OrderModel
{
    public const VALID_STATUSES = ['new', 'processing', 'shipped', 'completed', 'cancelled'];

    /**
     * Builds an order from the user's current cart inside one transaction:
     * stock is decremented with the same atomic-claim pattern as refresh-token
     * rotation (conditional UPDATE + rowCount check, not read-then-write) so
     * two concurrent checkouts — or a checkout racing an admin stock edit —
     * can't both succeed into negative stock. Any failure rolls the whole
     * thing back, so a partially-charged order can never exist.
     */
    public static function createFromCart(int $userId, string $address, string $phone, ?string $comment): array
    {
        $pdo = Database::connection();

        $cartStmt = $pdo->prepare(
            'SELECT ci.product_id, ci.quantity, p.title, p.artist, p.price
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = ?',
        );
        $cartStmt->execute([$userId]);
        $cartRows = $cartStmt->fetchAll();

        if ($cartRows === []) {
            throw new CheckoutException('cart_empty', 'Корзина пуста');
        }

        $pdo->beginTransaction();
        try {
            $orderId = (int) Database::table('orders')->insert([
                'user_id' => $userId,
                'status' => 'new',
                'total' => '0.00',
                'address' => $address,
                'phone' => $phone,
                'comment' => $comment,
                'created_at' => date('c'),
            ]);

            $total = 0.0;
            $claimStmt = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
            $itemStmt = $pdo->prepare(
                'INSERT INTO order_items (order_id, product_id, title_snapshot, price_snapshot, quantity) VALUES (?, ?, ?, ?, ?)',
            );

            foreach ($cartRows as $row) {
                $quantity = (int) $row['quantity'];

                $claimStmt->execute([$quantity, $row['product_id'], $quantity]);
                if ($claimStmt->rowCount() === 0) {
                    throw new CheckoutException('insufficient_stock', 'Недостаточно товара на складе: ' . $row['title']);
                }

                $priceSnapshot = number_format((float) $row['price'], 2, '.', '');
                $itemStmt->execute([
                    $orderId,
                    $row['product_id'],
                    $row['artist'] . ' — ' . $row['title'],
                    $priceSnapshot,
                    $quantity,
                ]);

                $total += (float) $priceSnapshot * $quantity;
            }

            Database::table('orders')->where('id', $orderId)->update(['total' => number_format($total, 2, '.', '')]);
            Database::table('cart_items')->where('user_id', $userId)->delete();

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        return self::findForUser($orderId, $userId);
    }

    /** @return list<array> */
    public static function forUser(int $userId): array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC');
        $stmt->execute([$userId]);
        return array_map([self::class, 'toPublic'], $stmt->fetchAll());
    }

    public static function findForUser(int $orderId, int $userId): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
        $stmt->execute([$orderId, $userId]);
        $order = $stmt->fetch();
        return $order === false ? null : self::toPublic($order);
    }

    /** @return list<array> All orders across all users, newest first — optionally scoped to one status. */
    public static function allForAdmin(?string $status = null): array
    {
        $sql = 'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o JOIN users u ON u.id = o.user_id';
        $bindings = [];
        if ($status !== null) {
            $sql .= ' WHERE o.status = ?';
            $bindings[] = $status;
        }
        $sql .= ' ORDER BY o.id DESC';

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($bindings);
        return array_map([self::class, 'toAdminPublic'], $stmt->fetchAll());
    }

    public static function findForAdmin(int $orderId): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?',
        );
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        return $order === false ? null : self::toAdminPublic($order);
    }

    public static function updateStatus(int $orderId, string $status): bool
    {
        return Database::table('orders')->where('id', $orderId)->update(['status' => $status]) > 0;
    }

    public static function toAdminPublic(array $order): array
    {
        return [
            ...self::toPublic($order),
            'user' => [
                'id' => (int) $order['user_id'],
                'name' => $order['user_name'],
                'email' => $order['user_email'],
            ],
        ];
    }

    public static function toPublic(array $order): array
    {
        return [
            'id' => (int) $order['id'],
            'status' => $order['status'],
            'total' => $order['total'],
            'address' => $order['address'],
            'phone' => $order['phone'],
            'comment' => $order['comment'],
            'items' => self::itemsFor((int) $order['id']),
            'created_at' => $order['created_at'],
        ];
    }

    private static function itemsFor(int $orderId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT product_id, title_snapshot, price_snapshot, quantity FROM order_items WHERE order_id = ? ORDER BY id',
        );
        $stmt->execute([$orderId]);

        return array_map(static fn (array $row) => [
            'product_id' => $row['product_id'] !== null ? (int) $row['product_id'] : null,
            'title_snapshot' => $row['title_snapshot'],
            'price_snapshot' => $row['price_snapshot'],
            'quantity' => (int) $row['quantity'],
        ], $stmt->fetchAll());
    }
}
