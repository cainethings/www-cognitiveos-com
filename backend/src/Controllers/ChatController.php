<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Response;
use PDO;
use Throwable;

final class ChatController
{
    public static function handle(): void
    {
        $payload = self::payload();

        $userId = trim((string) ($payload['user_id'] ?? ''));
        $message = trim((string) ($payload['message'] ?? ''));

        if ($userId === '') {
            Response::json([
                'ok' => false,
                'error' => [
                    'code' => 'validation_error',
                    'message' => 'Field "user_id" is required.',
                ],
            ], 422);
            return;
        }

        if ($message === '') {
            Response::json([
                'ok' => false,
                'error' => [
                    'code' => 'validation_error',
                    'message' => 'Field "message" is required.',
                ],
            ], 422);
            return;
        }

        try {
            $pdo = Database::connection();
            $pdo->beginTransaction();

            $insertMessage = $pdo->prepare(
                'INSERT INTO conversations (user_id, role, message, created_at)
                 VALUES (:user_id, :role, :message, NOW())'
            );

            $insertMessage->execute([
                'user_id' => $userId,
                'role' => 'user',
                'message' => $message,
            ]);
            $userRowId = (int) $pdo->lastInsertId();

            $assistantReply = self::phaseOneReply($message);

            $insertMessage->execute([
                'user_id' => $userId,
                'role' => 'assistant',
                'message' => $assistantReply,
            ]);
            $assistantRowId = (int) $pdo->lastInsertId();

            $pdo->commit();

            Response::json([
                'ok' => true,
                'response' => $assistantReply,
                'retrieved_memories' => [],
                'meta' => [
                    'phase' => 1,
                    'stored_rows' => [
                        'user' => $userRowId,
                        'assistant' => $assistantRowId,
                    ],
                ],
            ]);
        } catch (Throwable $exception) {
            if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
                $pdo->rollBack();
            }

            error_log('[ChatController] ' . $exception->getMessage());

            $env = getenv('APP_ENV') ?: 'local';
            $response = [
                'ok' => false,
                'error' => [
                    'code' => 'internal_error',
                    'message' => 'Internal server error.',
                ],
            ];

            if ($env !== 'production') {
                $response['error']['details'] = $exception->getMessage();
            }

            Response::json($response, 500);
        }
    }

    private static function payload(): array
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

    private static function phaseOneReply(string $userMessage): string
    {
        return sprintf(
            'Phase 1 placeholder: received your message "%s". Memory extraction and retrieval will be added in later phases.',
            trim($userMessage)
        );
    }
}
