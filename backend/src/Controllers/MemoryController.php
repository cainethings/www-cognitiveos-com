<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Request;
use App\Response;
use PDO;
use Throwable;

final class MemoryController
{
    public static function list(array $params = []): void
    {
        unset($params);

        $userId = trim((string) Request::query('user_id', ''));
        if ($userId === '') {
            self::validationError('Query parameter "user_id" is required.');
            return;
        }

        $includeInactive = filter_var(
            Request::query('include_inactive', false),
            FILTER_VALIDATE_BOOLEAN
        );
        $limit = self::normalizeLimit(Request::query('limit', 50), 100);

        try {
            $pdo = Database::connection();
            $conditions = ['user_id = :user_id'];
            if (!$includeInactive) {
                $conditions[] = 'active = 1';
            }

            $sql = 'SELECT id, user_id, memory_type, summary_text, confidence, source_message_id, created_at, active
                    FROM memory_events
                    WHERE ' . implode(' AND ', $conditions) . '
                    ORDER BY created_at DESC, id DESC
                    LIMIT :limit';

            $statement = $pdo->prepare($sql);
            $statement->bindValue(':user_id', $userId);
            $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
            $statement->execute();

            $items = array_map(static function (array $row): array {
                return [
                    'id' => (int) $row['id'],
                    'user_id' => $row['user_id'],
                    'memory_type' => $row['memory_type'],
                    'summary_text' => $row['summary_text'],
                    'confidence' => (float) $row['confidence'],
                    'source_message_id' => $row['source_message_id'] !== null
                        ? (int) $row['source_message_id']
                        : null,
                    'created_at' => $row['created_at'],
                    'active' => (bool) $row['active'],
                ];
            }, $statement->fetchAll());

            Response::json([
                'ok' => true,
                'items' => $items,
            ]);
        } catch (Throwable $exception) {
            self::serverError('Memories could not be loaded.', $exception);
        }
    }

    public static function delete(array $params = []): void
    {
        $memoryId = isset($params['id']) ? (int) $params['id'] : 0;
        $payload = Request::json();
        $userId = trim((string) ($payload['user_id'] ?? Request::query('user_id', '')));

        if ($memoryId <= 0) {
            self::validationError('A valid memory id is required.');
            return;
        }

        if ($userId === '') {
            self::validationError('Field or query parameter "user_id" is required.');
            return;
        }

        try {
            $pdo = Database::connection();
            $statement = $pdo->prepare(
                'UPDATE memory_events
                 SET active = 0
                 WHERE id = :id AND user_id = :user_id'
            );
            $statement->execute([
                'id' => $memoryId,
                'user_id' => $userId,
            ]);

            if ($statement->rowCount() === 0) {
                Response::json([
                    'ok' => false,
                    'error' => [
                        'code' => 'not_found',
                        'message' => 'Memory not found for this user.',
                    ],
                ], 404);
                return;
            }

            Response::json([
                'ok' => true,
                'deleted_id' => $memoryId,
            ]);
        } catch (Throwable $exception) {
            self::serverError('Memory could not be deleted.', $exception);
        }
    }

    private static function normalizeLimit($value, int $max): int
    {
        $limit = filter_var($value, FILTER_VALIDATE_INT, [
            'options' => [
                'default' => 50,
                'min_range' => 1,
                'max_range' => $max,
            ],
        ]);

        return (int) $limit;
    }

    private static function validationError(string $message): void
    {
        Response::json([
            'ok' => false,
            'error' => [
                'code' => 'validation_error',
                'message' => $message,
            ],
        ], 422);
    }

    private static function serverError(string $message, Throwable $exception): void
    {
        error_log('[MemoryController] ' . $exception->getMessage());

        $response = [
            'ok' => false,
            'error' => [
                'code' => 'internal_error',
                'message' => $message,
            ],
        ];

        if ((getenv('APP_ENV') ?: 'local') !== 'production') {
            $response['error']['details'] = $exception->getMessage();
        }

        Response::json($response, 500);
    }
}
