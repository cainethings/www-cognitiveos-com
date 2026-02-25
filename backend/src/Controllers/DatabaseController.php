<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Response;
use Throwable;

final class DatabaseController
{
    public static function check(): void
    {
        try {
            $pdo = Database::connection();
            $pdo->query('SELECT 1');
            Response::json(['database' => 'ok']);
        } catch (Throwable $exception) {
            Response::json(
                ['database' => 'error', 'message' => $exception->getMessage()],
                500
            );
        }
    }
}
