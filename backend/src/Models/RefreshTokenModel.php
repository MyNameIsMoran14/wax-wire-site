<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

class RefreshTokenModel
{
    public static function create(int $userId, string $tokenHash, string $expiresAt): int
    {
        return Database::table('refresh_tokens')->insert([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt,
            'revoked_at' => null,
            'created_at' => date('c'),
        ]);
    }

    /** Токен по хэшу, только если не отозван и не истёк. */
    public static function findValid(string $tokenHash): ?array
    {
        $row = Database::table('refresh_tokens')->where('token_hash', $tokenHash)->first();
        if ($row === null || $row['revoked_at'] !== null) {
            return null;
        }
        if (strtotime($row['expires_at']) < time()) {
            return null;
        }
        return $row;
    }

    public static function revoke(string $tokenHash): void
    {
        Database::table('refresh_tokens')
            ->where('token_hash', $tokenHash)
            ->update(['revoked_at' => date('c')]);
    }
}
