<?php

declare(strict_types=1);

namespace App\Core;

// Simple IP+action-scoped rate limiter backed by SQLite — a fixed lookback
// window, not a precise sliding one, which is plenty for guarding
// login/register against brute-force without adding infra (Redis etc).
class RateLimiter
{
    // Records the attempt FIRST, then counts — a separate check-then-insert
    // (count, decide, insert) leaves a gap where two near-simultaneous
    // requests can both count the same low number and both slip through.
    // Writing before counting means every request's own attempt is always
    // included in what it counts, closing that gap.
    public static function hit(string $key, int $maxAttempts, int $windowSeconds): bool
    {
        $pdo = Database::connection();

        // Opportunistic cleanup on every write so this table doesn't grow
        // forever without needing a cron job.
        $pdo->prepare('DELETE FROM rate_limits WHERE created_at < ?')
            ->execute([date('c', time() - 3600)]);

        $pdo->prepare('INSERT INTO rate_limits (key, created_at) VALUES (?, ?)')
            ->execute([$key, date('c')]);

        $since = date('c', time() - $windowSeconds);
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM rate_limits WHERE key = ? AND created_at > ?');
        $stmt->execute([$key, $since]);

        return (int) $stmt->fetchColumn() > $maxAttempts;
    }
}
