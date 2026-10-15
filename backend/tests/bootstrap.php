<?php

declare(strict_types=1);

// No PHPUnit, no Composer — this project has zero dependencies by design,
// so the test runner is the same style as the app itself: one autoloader,
// plain functions, plain assertions.

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

// Each run gets its own throwaway sqlite file built from schema.sql, so
// tests never touch the real database and never see another run's leftovers.
$testDbPath = sys_get_temp_dir() . '/wax_wire_test_' . bin2hex(random_bytes(8)) . '.sqlite';
putenv('DB_PATH=' . $testDbPath);

register_shutdown_function(static function () use ($testDbPath): void {
    App\Core\Database::disconnect();
    if (is_file($testDbPath)) {
        unlink($testDbPath);
    }
});

App\Core\Database::connection()->exec(file_get_contents(__DIR__ . '/../database/schema.sql'));

$GLOBALS['__testsPassed'] = 0;
$GLOBALS['__testsFailed'] = 0;

function test(string $name, callable $fn): void
{
    try {
        $fn();
        $GLOBALS['__testsPassed']++;
        echo "  ok   {$name}\n";
    } catch (Throwable $e) {
        $GLOBALS['__testsFailed']++;
        echo "FAIL   {$name}\n       " . $e->getMessage() . "\n";
    }
}

function assertSame(mixed $expected, mixed $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        $prefix = $message !== '' ? $message . ': ' : '';
        throw new RuntimeException(sprintf('%sexpected %s, got %s', $prefix, var_export($expected, true), var_export($actual, true)));
    }
}

function assertTrue(bool $condition, string $message = 'expected true'): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

// Minimal fixture helpers — each test creates its own rows so tests never
// depend on execution order or leak state into one another.
function makeUser(string $email): int
{
    return (int) App\Core\Database::table('users')->insert([
        'email' => $email,
        'password_hash' => password_hash('irrelevant', PASSWORD_BCRYPT),
        'name' => 'Test User',
        'role' => 'user',
        'created_at' => date('c'),
    ]);
}

function makeProduct(int $stock, string $price = '1000.00'): int
{
    return (int) App\Core\Database::table('products')->insert([
        'title' => 'Test Title',
        'artist' => 'Test Artist',
        'genre_id' => null,
        'type' => 'vinyl',
        'price' => $price,
        'stock' => $stock,
        'year' => null,
        'description' => null,
        'cover_url' => null,
        'created_at' => date('c'),
    ]);
}

function makeOrder(int $userId, string $status, array $items): int
{
    $orderId = (int) App\Core\Database::table('orders')->insert([
        'user_id' => $userId,
        'status' => $status,
        'total' => '0.00',
        'address' => 'test addr',
        'phone' => '123',
        'comment' => null,
        'created_at' => date('c'),
    ]);

    foreach ($items as [$productId, $quantity]) {
        App\Core\Database::table('order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $productId,
            'title_snapshot' => 'snapshot',
            'price_snapshot' => '1000.00',
            'quantity' => $quantity,
        ]);
    }

    return $orderId;
}

function stockOf(int $productId): int
{
    $row = App\Core\Database::table('products')->where('id', $productId)->first();
    return (int) $row['stock'];
}
