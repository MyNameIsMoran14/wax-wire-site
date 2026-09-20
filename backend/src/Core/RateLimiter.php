<?php

declare(strict_types=1);

namespace App\Core;

// Simple IP+action-scoped rate limiter backed by SQLite — a fixed lookback
// window, not a precise sliding one, which is plenty for guarding
// login/register against brute-force without adding infra (Redis etc).
class RateLimiter
{
    public static function tooManyAttempts(string $key, int $maxAttempts, int $windowSeconds): bool
    {
        $pdo = Database::connection();
        $since = date('c', time() - $windowSeconds);

        $stmt = $pdo->prepare('SELECT COUNT(*) FROM rate_limits WHERE key = ? AND created_at > ?');
        $stmt->execute([$key, $since]);

        return (int) $stmt->fetchColumn() >= $maxAttempts;
    }

    public static function hit(string $key): void
    {
        // Opportunistic cleanup on every write so this table doesn't grow
        // forever without needing a cron job.
        Database::connection()
            ->prepare('DELETE FROM rate_limits WHERE created_at < ?')
            ->execute([date('c', time() - 3600)]);

        Database::table('rate_limits')->insert([
            'key' => $key,
            'created_at' => date('c'),
        ]);
    }
}
