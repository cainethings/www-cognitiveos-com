<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Response;
use Throwable;

final class NewsletterController
{
    public static function subscribe(): void
    {
        $payload = self::payload();
        $email = isset($payload['email']) ? strtolower(trim((string) $payload['email'])) : '';

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Invalid email address.'], 422);
            return;
        }

        try {
            $pdo = Database::connection();
            $statement = $pdo->prepare(
                'INSERT INTO newsletter_subscriptions (email, status) '
                . 'VALUES (:email, "subscribed") '
                . 'ON DUPLICATE KEY UPDATE status = "subscribed", updated_at = CURRENT_TIMESTAMP'
            );
            $statement->execute(['email' => $email]);

            $rowCount = $statement->rowCount();
            $alreadySubscribed = $rowCount === 0 || $rowCount === 2;

            Response::json([
                'status' => 'subscribed',
                'email' => $email,
                'already_subscribed' => $alreadySubscribed,
            ]);
        } catch (Throwable $exception) {
            error_log('[NewsletterController] ' . $exception->getMessage());

            $env = getenv('APP_ENV') ?: 'local';
            $payload = ['error' => 'Unable to subscribe right now.'];
            if ($env !== 'production') {
                $payload['details'] = $exception->getMessage();
            }

            Response::json($payload, 500);
        }
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
