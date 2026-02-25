<?php

declare(strict_types=1);

namespace App\Controllers;

final class HealthController
{
    public static function show(): array
    {
        return [
            'status' => 'ok',
            'service' => 'api-starter',
            'timestamp' => gmdate('c'),
        ];
    }
}
