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

    // Returns the row regardless of revoked/expired state — the caller needs
    // to tell "never existed" apart from "already used" (theft signal) apart
    // from "just expired".
    public static function findByHash(string $tokenHash): ?array
    {
        return Database::table('refresh_tokens')->where('token_hash', $tokenHash)->first();
    }

    public static function revoke(string $tokenHash): void
    {
        Database::table('refresh_tokens')
            ->where('token_hash', $tokenHash)
            ->update(['revoked_at' => date('c')]);
    }

    // Called when a refresh token gets presented a second time (it was
    // already rotated away once before) — that's a strong signal it was
    // stolen and both the legitimate user and the attacker are using it, so
    // every session for this account is killed rather than just the one token.
    public static function revokeAllForUser(int $userId): void
    {
        Database::table('refresh_tokens')
            ->where('user_id', $userId)
            ->update(['revoked_at' => date('c')]);
    }
}
