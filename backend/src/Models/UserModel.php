<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class UserModel
{
    public static function findByEmail(string $email): ?array
    {
        return Database::table('users')->where('email', $email)->first();
    }

    public static function findById(int $id): ?array
    {
        return Database::table('users')->where('id', $id)->first();
    }

    public static function create(string $email, string $passwordHash, string $name): int
    {
        return Database::table('users')->insert([
            'email' => $email,
            'password_hash' => $passwordHash,
            'name' => $name,
            'role' => 'user',
            'created_at' => date('c'),
        ]);
    }

    /** Убирает password_hash перед отдачей на фронт. */
    public static function toPublic(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'created_at' => $user['created_at'],
        ];
    }
}
