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

    public static function updateProfile(int $id, string $name, string $email): void
    {
        Database::table('users')->where('id', $id)->update([
            'name' => $name,
            'email' => self::normalizeEmail($email),
        ]);
    }

    /** Returns the replaced URL after a serialized update, for safe file cleanup. */
    public static function replaceProfileImage(int $id, string $kind, ?string $url): ?string
    {
        if (!in_array($kind, ['avatar', 'banner'], true)) {
            throw new \InvalidArgumentException('Unknown profile image kind');
        }
        $column = $kind . '_url';
        $pdo = Database::connection();
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $user = self::findById($id);
            if ($user === null) {
                throw new \RuntimeException('User no longer exists');
            }
            Database::table('users')->where('id', $id)->update([$column => $url]);
            $pdo->exec('COMMIT');
            return $user[$column] ?? null;
        } catch (\Throwable $error) {
            $pdo->exec('ROLLBACK');
            throw $error;
        }
    }

    public static function updatePassword(int $id, string $passwordHash): void
    {
        Database::table('users')->where('id', $id)->update(['password_hash' => $passwordHash]);
    }

    public static function findOrCreateGoogleUser(array $claims): array
    {
        $pdo = Database::connection();
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $stmt = $pdo->prepare('SELECT user_id FROM google_accounts WHERE google_sub = ?');
            $stmt->execute([$claims['sub']]);
            $userId = $stmt->fetchColumn();
            if ($userId !== false) {
                $user = self::findById((int) $userId);
            } else {
                $email = self::normalizeEmail($claims['email']);
                $user = self::findByEmail($email);
                // Google is authoritative for Gmail and managed Workspace addresses.
                // Other existing accounts need an explicit authenticated linking flow.
                $googleOwnsEmail = str_ends_with($email, '@gmail.com')
                    || str_ends_with($email, '@googlemail.com') || !empty($claims['hd']);
                if ($user !== null && !$googleOwnsEmail) {
                    throw new \RuntimeException('google_email_link_required');
                }
                if ($user === null) {
                    $name = $claims['name'] ?? explode('@', $email, 2)[0];
                    $id = self::create($email, password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT), $name);
                    $user = self::findById($id);
                }
                $pdo->prepare('INSERT INTO google_accounts (google_sub, user_id) VALUES (?, ?)')
                    ->execute([$claims['sub'], $user['id']]);
            }
            $pdo->exec('COMMIT');
            return $user;
        } catch (\Throwable $error) {
            $pdo->exec('ROLLBACK');
            throw $error;
        }
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
            'avatar_url' => $user['avatar_url'] ?? null,
            'banner_url' => $user['banner_url'] ?? null,
        ];
    }
}
