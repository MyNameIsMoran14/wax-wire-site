<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class ProductModel
{
    public const PER_PAGE = 12;

    private const VALID_TYPES = ['vinyl', 'cd', 'equipment'];

    // Raw SQL rather than QueryBuilder here: the query needs optional
    // AND-ed filters, a LIKE search across two columns, and a numeric CAST
    // for sorting/range on the TEXT price column — none of which
    // QueryBuilder's equality-only `where()` can express.
    /**
     * @param array{genre?: int, type?: string, price_min?: string, price_max?: string, q?: string, sort?: string, page?: int} $filters
     * @return array{items: list<array>, page: int, total: int}
     */
    public static function search(array $filters): array
    {
        $pdo = Database::connection();

        $where = [];
        $bindings = [];

        if (isset($filters['genre'])) {
            $where[] = 'p.genre_id = ?';
            $bindings[] = $filters['genre'];
        }

        if (isset($filters['type']) && in_array($filters['type'], self::VALID_TYPES, true)) {
            $where[] = 'p.type = ?';
            $bindings[] = $filters['type'];
        }

        if (isset($filters['price_min']) && is_numeric($filters['price_min'])) {
            $where[] = 'CAST(p.price AS REAL) >= ?';
            $bindings[] = (float) $filters['price_min'];
        }

        if (isset($filters['price_max']) && is_numeric($filters['price_max'])) {
            $where[] = 'CAST(p.price AS REAL) <= ?';
            $bindings[] = (float) $filters['price_max'];
        }

        if (isset($filters['q']) && $filters['q'] !== '') {
            $where[] = "(p.title LIKE ? ESCAPE '\\' OR p.artist LIKE ? ESCAPE '\\')";
            $needle = '%' . self::escapeLike($filters['q']) . '%';
            $bindings[] = $needle;
            $bindings[] = $needle;
        }

        $whereSql = $where === [] ? '' : ' WHERE ' . implode(' AND ', $where);

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products p$whereSql");
        $countStmt->execute($bindings);
        $total = (int) $countStmt->fetchColumn();

        $orderSql = match ($filters['sort'] ?? 'new') {
            'price_asc' => 'CAST(p.price AS REAL) ASC',
            'price_desc' => 'CAST(p.price AS REAL) DESC',
            default => 'p.id DESC', // "new" — id proxies insertion order
        };

        $page = max(1, (int) ($filters['page'] ?? 1));
        $offset = self::PER_PAGE * ($page - 1);

        $stmt = $pdo->prepare(
            "SELECT p.*, g.id AS joined_genre_id, g.name AS joined_genre_name
             FROM products p
             LEFT JOIN genres g ON g.id = p.genre_id
             $whereSql
             ORDER BY $orderSql
             LIMIT ? OFFSET ?",
        );
        $stmt->execute([...$bindings, self::PER_PAGE, $offset]);

        return [
            'items' => array_map([self::class, 'rowToPublic'], $stmt->fetchAll()),
            'page' => $page,
            'total' => $total,
        ];
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT p.*, g.id AS joined_genre_id, g.name AS joined_genre_name
             FROM products p
             LEFT JOIN genres g ON g.id = p.genre_id
             WHERE p.id = ?',
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    /** Full unpaginated catalog for the admin list view, newest first. */
    public static function allAdmin(): array
    {
        $stmt = Database::connection()->query(
            'SELECT p.*, g.id AS joined_genre_id, g.name AS joined_genre_name
             FROM products p
             LEFT JOIN genres g ON g.id = p.genre_id
             ORDER BY p.id DESC',
        );

        return array_map([self::class, 'rowToPublic'], $stmt->fetchAll());
    }

    /** @param array{title: string, artist: string, genre_id: ?int, type: string, price: string, stock: int, year: ?int, description: ?string} $data */
    public static function create(array $data): int
    {
        return Database::table('products')->insert([
            'title' => $data['title'],
            'artist' => $data['artist'],
            'genre_id' => $data['genre_id'],
            'type' => $data['type'],
            'price' => $data['price'],
            'stock' => $data['stock'],
            'year' => $data['year'],
            'description' => $data['description'],
            'cover_url' => null,
            'created_at' => date('c'),
        ]);
    }

    /** Partial update — only the keys present in $data are written. */
    public static function update(int $id, array $data): bool
    {
        if ($data === []) {
            return true;
        }

        return Database::table('products')->where('id', $id)->update($data) > 0;
    }

    public static function delete(int $id): bool
    {
        return Database::table('products')->where('id', $id)->delete() > 0;
    }

    public static function setCoverUrl(int $id, string $url): void
    {
        Database::table('products')->where('id', $id)->update(['cover_url' => $url]);
    }

    public static function tracklistFor(int $productId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT position, title, duration_seconds FROM product_tracklist WHERE product_id = ? ORDER BY position ASC',
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    /** A row from search()/findById() (joined with genres) — no tracklist, used in list views. */
    public static function rowToPublic(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'artist' => $row['artist'],
            'genre' => $row['joined_genre_id'] !== null
                ? ['id' => (int) $row['joined_genre_id'], 'name' => $row['joined_genre_name']]
                : null,
            'type' => $row['type'],
            'price' => number_format((float) $row['price'], 2, '.', ''),
            'stock' => (int) $row['stock'],
            'year' => $row['year'] !== null ? (int) $row['year'] : null,
            'description' => $row['description'],
            'cover_url' => $row['cover_url'],
            'created_at' => $row['created_at'],
        ];
    }

    /** Full product incl. tracklist — used by the single-product endpoint. */
    public static function toDetailedPublic(array $row): array
    {
        return [
            ...self::rowToPublic($row),
            'tracklist' => array_map(static fn (array $t) => [
                'position' => (int) $t['position'],
                'title' => $t['title'],
                'duration_seconds' => (int) $t['duration_seconds'],
            ], self::tracklistFor((int) $row['id'])),
        ];
    }

    // Escapes SQLite LIKE wildcards in user input (%, _) so a search for e.g.
    // "50%" is treated as a literal string, not a pattern.
    private static function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
