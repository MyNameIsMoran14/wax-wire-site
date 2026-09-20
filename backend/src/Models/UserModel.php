<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class UserModel
{
    // Emails are matched case-insensitively (User@x.com === user@x.com), so
    // every read/write normalizes to lowercase first — otherwise the same
    // person could end up with two accounts differing only by case.
    public static function findByEmail(string $email): ?array
    {
        return Database::table('users')->where('email', self::normalizeEmail($email))->first();
    }

    public static function findById(int $id): ?array
    {
        return Database::table('users')->where('id', $id)->first();
    }

    public static function create(string $email, string $passwordHash, string $name): int
    {
        return Database::table('users')->insert([
            'email' => self::normalizeEmail($email),
            'password_hash' => $passwordHash,
            'name' => $name,
            'role' => 'user',
            'created_at' => date('c'),
        ]);
    }

    private static function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
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
