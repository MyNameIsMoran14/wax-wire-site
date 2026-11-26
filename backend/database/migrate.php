<?php

declare(strict_types=1);

// Создаёт/обновляет database/vinyl.sqlite по schema.sql.
// Запуск: php database/migrate.php

$dbPath = getenv('DB_PATH') ?: __DIR__ . '/vinyl.sqlite';
$schema = file_get_contents(__DIR__ . '/schema.sql');

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('BEGIN IMMEDIATE');
try {
    $pdo->exec($schema);
    $columns = $pdo->query('PRAGMA table_info(users)')->fetchAll(PDO::FETCH_COLUMN, 1);
    foreach (['avatar_url', 'banner_url'] as $column) {
        if (!in_array($column, $columns, true)) {
            $pdo->exec("ALTER TABLE users ADD COLUMN $column TEXT");
        }
    }
    $pdo->exec('COMMIT');
} catch (Throwable $error) {
    $pdo->exec('ROLLBACK');
    throw $error;
}

echo "OK: $dbPath\n";
