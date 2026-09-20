<?php

declare(strict_types=1);

// Создаёт/обновляет database/vinyl.sqlite по schema.sql.
// Запуск: php database/migrate.php

$dbPath = __DIR__ . '/vinyl.sqlite';
$schema = file_get_contents(__DIR__ . '/schema.sql');

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec($schema);

echo "OK: $dbPath\n";
