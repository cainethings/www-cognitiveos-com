<?php

declare(strict_types=1);

namespace App;

final class Request
{
    public static function json(): array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || trim($raw) === '') {
            return $_POST ?: [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            Response::json([
                'ok' => false,
                'error' => [
                    'code' => 'invalid_json',
                    'message' => 'Request body must be valid JSON.',
                ],
            ], 422);
            exit;
        }

        return $decoded;
    }

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }
}
