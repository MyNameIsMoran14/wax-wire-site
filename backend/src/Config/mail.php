<?php

declare(strict_types=1);

$local = __DIR__ . '/mail.local.php';
return [
    'username' => 'lizmoran1472@gmail.com',
    'password' => getenv('GMAIL_APP_PASSWORD') ?: '',
    ...(is_file($local) ? require $local : []),
];
