<?php

declare(strict_types=1);

namespace App\Core;

// Loads config.php exactly once per request and caches the result. Plain
// `require` (or even `require_once`) at each call site is a trap here:
// config.php declares a top-level function, so a second plain `require`
// within the same request fatals with "Cannot redeclare", while
// `require_once` avoids that but silently returns `true` (not the array)
// on every call after the first. Routing through one cached accessor
// sidesteps both.
class Config
{
    private static ?array $data = null;

    public static function get(): array
    {
        if (self::$data === null) {
            self::$data = require __DIR__ . '/../Config/config.php';
        }
        return self::$data;
    }
}
