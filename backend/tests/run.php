<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

foreach (glob(__DIR__ . '/*Test.php') as $file) {
    require $file;
}

$passed = $GLOBALS['__testsPassed'];
$failed = $GLOBALS['__testsFailed'];

echo "\n{$passed} passed, {$failed} failed\n";

exit($failed > 0 ? 1 : 0);
