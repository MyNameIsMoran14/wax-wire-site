<?php

declare(strict_types=1);

// Populates genres/products/product_tracklist with demo catalog data —
// same artists/titles/prices the frontend was using as mock data, so
// switching the catalog page over to the real API doesn't change what's on screen.
// Idempotent: does nothing if products already exist.
// Run: php database/seed.php

$dbPath = __DIR__ . '/vinyl.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

$existing = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
if ($existing > 0) {
    echo "Skipped: products table already has $existing row(s)\n";
    exit;
}

$genres = ['Pop', 'Rock', 'Indie', 'Alternative'];
$genreIds = [];
$insertGenre = $pdo->prepare('INSERT INTO genres (name) VALUES (?)');
foreach ($genres as $name) {
    $insertGenre->execute([$name]);
    $genreIds[$name] = (int) $pdo->lastInsertId();
}

$products = [
    ['id' => 1, 'title' => 'Happier Than Ever', 'artist' => 'Billie Eilish', 'genre' => 'Pop', 'type' => 'vinyl', 'price' => '6700.00', 'stock' => 5, 'year' => 2021],
    ['id' => 2, 'title' => 'AM', 'artist' => 'Arctic Monkeys', 'genre' => 'Rock', 'type' => 'vinyl', 'price' => '5100.00', 'stock' => 3, 'year' => 2013],
    ['id' => 3, 'title' => 'Bad', 'artist' => 'Michael Jackson', 'genre' => 'Pop', 'type' => 'vinyl', 'price' => '3500.00', 'stock' => 8, 'year' => 1987],
    ['id' => 4, 'title' => 'xx', 'artist' => 'The xx', 'genre' => 'Indie', 'type' => 'vinyl', 'price' => '4500.00', 'stock' => 4, 'year' => 2009],
    ['id' => 5, 'title' => 'X&Y', 'artist' => 'Coldplay', 'genre' => 'Rock', 'type' => 'vinyl', 'price' => '5100.00', 'stock' => 6, 'year' => 2005],
    ['id' => 6, 'title' => 'Nevermind', 'artist' => 'Nirvana', 'genre' => 'Rock', 'type' => 'vinyl', 'price' => '6800.00', 'stock' => 2, 'year' => 1991],
    ['id' => 7, 'title' => 'Direct Hits', 'artist' => 'The Killers', 'genre' => 'Rock', 'type' => 'vinyl', 'price' => '2800.00', 'stock' => 7, 'year' => 2013],
    ['id' => 8, 'title' => 'MTV Unplugged', 'artist' => 'Placebo', 'genre' => 'Alternative', 'type' => 'vinyl', 'price' => '5500.00', 'stock' => 3, 'year' => 2004],
    ['id' => 9, 'title' => 'AT-LP120X', 'artist' => 'Audio-Technica', 'genre' => null, 'type' => 'equipment', 'price' => '35700.00', 'stock' => 4, 'year' => null],
    ['id' => 10, 'title' => 'Debut Carbon', 'artist' => 'Pro-Ject', 'genre' => null, 'type' => 'equipment', 'price' => '48200.00', 'stock' => 2, 'year' => null],
    ['id' => 11, 'title' => 'PS-LX310BT', 'artist' => 'Sony', 'genre' => null, 'type' => 'equipment', 'price' => '19900.00', 'stock' => 5, 'year' => null],
    ['id' => 12, 'title' => 'SL-1200MK7', 'artist' => 'Technics', 'genre' => null, 'type' => 'equipment', 'price' => '89000.00', 'stock' => 1, 'year' => null],
];

$insertProduct = $pdo->prepare(
    'INSERT INTO products (id, title, artist, genre_id, type, price, stock, year, description, cover_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)',
);
$insertTrack = $pdo->prepare(
    'INSERT INTO product_tracklist (product_id, position, title, duration_seconds) VALUES (?, ?, ?, ?)',
);

$createdAt = date('c');
foreach ($products as $p) {
    $insertProduct->execute([
        $p['id'],
        $p['title'],
        $p['artist'],
        $p['genre'] !== null ? $genreIds[$p['genre']] : null,
        $p['type'],
        $p['price'],
        $p['stock'],
        $p['year'],
        $createdAt,
    ]);

    // Placeholder tracklist for music items — real track data is out of
    // scope for the seed, just enough rows for the detail page to render.
    if ($p['type'] !== 'equipment') {
        for ($i = 1; $i <= 6; $i++) {
            $insertTrack->execute([$p['id'], $i, "Track $i", 180 + $i * 15]);
        }
    }
}

echo 'OK: seeded ' . count($products) . " products, " . count($genres) . " genres\n";
