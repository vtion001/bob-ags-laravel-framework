<?php

namespace App\Exceptions;

use Exception;

class UnauthorizedException extends Exception
{
    public function __construct(string $message = 'Unauthorized')
    {
        parent::__construct($message);
    }
}