<?php

declare(strict_types=1);

namespace App\Models;

use RuntimeException;

// Carries the API error code straight from OrderModel to the controller, so
// the controller doesn't have to re-derive "which 409 is this" from a plain message string.
class CheckoutException extends RuntimeException
{
    public function __construct(public readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }
}
