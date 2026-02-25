<?php

declare(strict_types=1);

namespace App\Controllers;

final class StarterController
{
    public static function info(): array
    {
        return [
            'name' => 'PHP API Starter',
            'version' => '1.0.0',
            'endpoints' => [
                ['method' => 'GET', 'path' => '/api/health'],
                ['method' => 'GET', 'path' => '/api/info'],
                ['method' => 'POST', 'path' => '/api/echo'],
            ],
        ];
    }

    public static function echo(): array
    {
        return [
            'received' => self::payload(),
            'timestamp' => gmdate('c'),
        ];
    }

    private static function payload(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw !== false && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $_POST ?: [];
    }
}
