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

    // Conditional UPDATE — only revokes (and returns true) if the token was
    // still un-revoked at that exact moment. This is what makes rotation
    // race-safe: if two requests present the same refresh token at once
    // (two tabs, or a thief racing the real user), the `WHERE revoked_at IS
    // NULL` guard means only ONE of them can ever flip it, because SQLite
    // serializes writes — the other gets 0 affected rows and knows it lost.
    // Plain read-then-write (SELECT to check, then UPDATE) has a gap where
    // both requests can read "not revoked yet" before either writes.
    public static function revokeIfActive(string $tokenHash): bool
    {
        $stmt = Database::connection()->prepare(
            'UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL',
        );
        $stmt->execute([date('c'), $tokenHash]);
        return $stmt->rowCount() > 0;
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
