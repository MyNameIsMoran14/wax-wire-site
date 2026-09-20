<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class GenreModel
{
    public static function all(): array
    {
        return Database::table('genres')->orderBy('name')->get();
    }

    public static function findById(int $id): ?array
    {
        return Database::table('genres')->where('id', $id)->first();
    }

    public static function create(string $name): int
    {
        return Database::table('genres')->insert(['name' => $name]);
    }

    public static function update(int $id, string $name): bool
    {
        return Database::table('genres')->where('id', $id)->update(['name' => $name]) > 0;
    }

    // Products keep their row (genre_id just goes NULL via the FK's ON
    // DELETE SET NULL) rather than being deleted along with the genre.
    public static function delete(int $id): bool
    {
        return Database::table('genres')->where('id', $id)->delete() > 0;
    }

    // Checked explicitly (rather than letting the UNIQUE constraint throw)
    // so a duplicate name comes back as a normal validation_error, not a 500.
    public static function nameExists(string $name, ?int $excludingId = null): bool
    {
        $stmt = Database::connection()->prepare(
            'SELECT COUNT(*) FROM genres WHERE name = ? AND id != ?',
        );
        $stmt->execute([$name, $excludingId ?? 0]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public static function toPublic(array $genre): array
    {
        return [
            'id' => (int) $genre['id'],
            'name' => $genre['name'],
        ];
    }
}
