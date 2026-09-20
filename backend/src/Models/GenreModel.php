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

    public static function toPublic(array $genre): array
    {
        return [
            'id' => (int) $genre['id'],
            'name' => $genre['name'],
        ];
    }
}
