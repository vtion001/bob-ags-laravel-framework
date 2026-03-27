<?php

namespace App\Exceptions;

use Exception;

class ServerException extends Exception
{
    public function __construct(string $message = 'Server error')
    {
        parent::__construct($message);
    }
}