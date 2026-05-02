<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database;
use App\Request;
use App\Response;
use PDO;
use Throwable;

final class ChatController
{
    private const STOP_WORDS = [
        'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'but', 'by', 'for',
        'from', 'get', 'has', 'have', 'i', 'if', 'in', 'into', 'is', 'it', 'just', 'like',
        'me', 'my', 'of', 'on', 'or', 'so', 'that', 'the', 'their', 'them', 'they', 'this',
        'to', 'too', 'up', 'want', 'was', 'we', 'were', 'what', 'when', 'with', 'would', 'you',
        'your',
    ];

    public static function handle(array $params = []): void
    {
        unset($params);

        $payload = Request::json();
        $userId = trim((string) ($payload['user_id'] ?? ''));
        $message = self::normalizeText((string) ($payload['message'] ?? ''));

        if ($userId === '') {
            self::validationError('Field "user_id" is required.');
            return;
        }

        if ($message === '') {
            self::validationError('Field "message" is required.');
            return;
        }

        try {
            $pdo = Database::connection();
            $pdo->beginTransaction();

            $threadId = self::resolveActiveThreadId($pdo, $userId);
            $userMessageId = self::storeConversation($pdo, $threadId, $userId, 'user', $message);
            $storedMemories = self::extractAndStoreMemories($pdo, $userId, $message, $userMessageId);
            $retrievedMemories = self::retrieveRelevantMemories($pdo, $userId, $message);
            $assistantReply = self::composeAssistantReply($message, $storedMemories, $retrievedMemories);
            $assistantMessageId = self::storeConversation($pdo, $threadId, $userId, 'assistant', $assistantReply);
            self::updateThreadPreview($pdo, $threadId, $assistantReply);

            $pdo->commit();

            Response::json([
                'ok' => true,
                'response' => $assistantReply,
                'stored_memories' => $storedMemories,
                'retrieved_memories' => $retrievedMemories,
                'meta' => [
                    'phase' => 'memory_pipeline_v1',
                    'thread_id' => $threadId,
                    'stored_rows' => [
                        'user' => $userMessageId,
                        'assistant' => $assistantMessageId,
                    ],
                ],
            ]);
        } catch (Throwable $exception) {
            if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
                $pdo->rollBack();
            }

            error_log('[ChatController] ' . $exception->getMessage());

            $response = [
                'ok' => false,
                'error' => [
                    'code' => 'internal_error',
                    'message' => 'Internal server error.',
                ],
            ];

            if ((getenv('APP_ENV') ?: 'local') !== 'production') {
                $response['error']['details'] = $exception->getMessage();
            }

            Response::json($response, 500);
        }
    }

    public static function listConversations(array $params = []): void
    {
        unset($params);

        $userId = trim((string) Request::query('user_id', ''));
        if ($userId === '') {
            self::validationError('Query parameter "user_id" is required.');
            return;
        }

        $limit = self::normalizeLimit(Request::query('limit', 50), 100);

        try {
            $pdo = Database::connection();
            $statement = $pdo->prepare(
                'SELECT id, thread_id, user_id, role, message, created_at
                 FROM conversations
                 WHERE user_id = :user_id
                   AND deleted_at IS NULL
                 ORDER BY created_at ASC, id ASC
                 LIMIT :limit'
            );
            $statement->bindValue(':user_id', $userId);
            $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
            $statement->execute();

            Response::json([
                'ok' => true,
                'items' => $statement->fetchAll(),
            ]);
        } catch (Throwable $exception) {
            self::serverError('Conversation history could not be loaded.', $exception);
        }
    }

    private static function resolveActiveThreadId(PDO $pdo, string $userId): int
    {
        $select = $pdo->prepare(
            'SELECT id
             FROM chat_threads
             WHERE user_id = :user_id
               AND deleted_at IS NULL
             ORDER BY is_persisted DESC, updated_at DESC, id DESC
             LIMIT 1'
        );
        $select->execute(['user_id' => $userId]);
        $row = $select->fetch();

        if (is_array($row) && isset($row['id'])) {
            return (int) $row['id'];
        }

        $insert = $pdo->prepare(
            'INSERT INTO chat_threads
                (user_id, title, is_persisted, is_ephemeral, expires_at, last_message_preview, last_message_at)
             VALUES
                (:user_id, :title, :is_persisted, :is_ephemeral, :expires_at, :last_message_preview, NOW())'
        );

        $insert->execute([
            'user_id' => $userId,
            'title' => self::defaultThreadTitle(),
            'is_persisted' => 1,
            'is_ephemeral' => 0,
            'expires_at' => null,
            'last_message_preview' => null,
        ]);

        return (int) $pdo->lastInsertId();
    }

    private static function storeConversation(
        PDO $pdo,
        int $threadId,
        string $userId,
        string $role,
        string $message
    ): int
    {
        $statement = $pdo->prepare(
            'INSERT INTO conversations (thread_id, user_id, role, message)
             VALUES (:thread_id, :user_id, :role, :message)'
        );
        $statement->execute([
            'thread_id' => $threadId,
            'user_id' => $userId,
            'role' => $role,
            'message' => $message,
        ]);

        return (int) $pdo->lastInsertId();
    }

    private static function updateThreadPreview(PDO $pdo, int $threadId, string $assistantReply): void
    {
        $statement = $pdo->prepare(
            'UPDATE chat_threads
             SET last_message_preview = :last_message_preview,
                 last_message_at = NOW()
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $threadId,
            'last_message_preview' => self::truncatePreview($assistantReply),
        ]);
    }

    private static function extractAndStoreMemories(
        PDO $pdo,
        string $userId,
        string $message,
        int $sourceMessageId
    ): array {
        $candidates = self::extractCandidateMemories($message);
        if ($candidates === []) {
            return [];
        }

        $statement = $pdo->prepare(
            'INSERT INTO memory_events
                (user_id, memory_type, summary_text, confidence, embedding, source_message_id, active)
             VALUES
                (:user_id, :memory_type, :summary_text, :confidence, :embedding, :source_message_id, :active)'
        );

        $stored = [];

        foreach ($candidates as $candidate) {
            $statement->execute([
                'user_id' => $userId,
                'memory_type' => $candidate['memory_type'],
                'summary_text' => $candidate['summary_text'],
                'confidence' => $candidate['confidence'],
                'embedding' => '[]',
                'source_message_id' => $sourceMessageId,
                'active' => 1,
            ]);

            $stored[] = [
                'id' => (int) $pdo->lastInsertId(),
                'memory_type' => $candidate['memory_type'],
                'summary_text' => $candidate['summary_text'],
                'confidence' => $candidate['confidence'],
                'source_message_id' => $sourceMessageId,
                'active' => true,
            ];
        }

        return $stored;
    }

    private static function extractCandidateMemories(string $message): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+|\n+/', $message) ?: [];
        $results = [];
        $seen = [];

        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if ($sentence === '') {
                continue;
            }

            $lower = strtolower($sentence);
            $memoryType = null;
            $confidence = 0.65;
            $summary = $sentence;

            if (preg_match('/\b(my name is|i am|i\'m|i work as|i study|i live in)\b/i', $sentence)) {
                $memoryType = 'profile';
                $confidence = 0.92;
            } elseif (preg_match('/\b(i prefer|i like|i love|my favorite|i enjoy)\b/i', $sentence)) {
                $memoryType = 'profile';
                $confidence = 0.88;
            } elseif (preg_match('/\b(my goal is|i want to|i am trying to|i\'m trying to|my target is|by [a-z0-9 ,\-]+ i want to)\b/i', $sentence)) {
                $memoryType = 'goals';
                $confidence = 0.9;
            } elseif (preg_match('/\b(i will|i need to|i must|remind me to|i plan to)\b/i', $sentence)) {
                $memoryType = 'commitments';
                $confidence = 0.86;
            } elseif (preg_match('/\b(i usually|every day|every week|normally|typically|often|rarely)\b/i', $sentence)) {
                $memoryType = 'context';
                $confidence = 0.72;
            }

            if ($memoryType === null) {
                continue;
            }

            $summary = self::cleanMemorySummary($summary, $memoryType, $lower);
            $key = strtolower($memoryType . '|' . $summary);

            if ($summary === '' || isset($seen[$key])) {
                continue;
            }

            $results[] = [
                'memory_type' => $memoryType,
                'summary_text' => $summary,
                'confidence' => $confidence,
            ];
            $seen[$key] = true;
        }

        return array_slice($results, 0, 5);
    }

    private static function retrieveRelevantMemories(PDO $pdo, string $userId, string $message): array
    {
        $statement = $pdo->prepare(
            'SELECT id, memory_type, summary_text, confidence, source_message_id, created_at, active
             FROM memory_events
             WHERE user_id = :user_id AND active = 1
             ORDER BY created_at DESC, id DESC
             LIMIT 100'
        );
        $statement->execute(['user_id' => $userId]);
        $rows = $statement->fetchAll();

        if ($rows === []) {
            return [];
        }

        $keywords = self::extractKeywords($message);
        $priorities = self::inferPriorityTypes($message);
        $now = time();

        foreach ($rows as &$row) {
            $score = (float) $row['confidence'] * 10;
            $summary = strtolower((string) $row['summary_text']);

            foreach ($keywords as $keyword) {
                if (strpos($summary, $keyword) !== false) {
                    $score += 4;
                }
            }

            if (in_array((string) $row['memory_type'], $priorities, true)) {
                $score += 3;
            }

            $createdAt = strtotime((string) $row['created_at']) ?: $now;
            $ageDays = max(0, ($now - $createdAt) / 86400);
            $score += max(0, 2 - min(2, $ageDays / 7));

            $row['score'] = round($score, 2);
            $row['active'] = (bool) $row['active'];
            $row['id'] = (int) $row['id'];
            $row['source_message_id'] = $row['source_message_id'] !== null
                ? (int) $row['source_message_id']
                : null;
            $row['confidence'] = (float) $row['confidence'];
        }
        unset($row);

        usort($rows, static function (array $left, array $right): int {
            return $right['score'] <=> $left['score'];
        });

        return array_slice($rows, 0, 4);
    }

    private static function composeAssistantReply(
        string $message,
        array $storedMemories,
        array $retrievedMemories
    ): string {
        $parts = [];

        if ($storedMemories !== []) {
            $memoryBits = array_map(
                static fn (array $memory): string => $memory['summary_text'],
                array_slice($storedMemories, 0, 2)
            );
            $parts[] = 'I stored this for future context: ' . implode('; ', $memoryBits) . '.';
        }

        if ($retrievedMemories !== []) {
            $retrievedBits = array_map(
                static fn (array $memory): string => $memory['summary_text'],
                array_slice($retrievedMemories, 0, 2)
            );
            $parts[] = 'I also used relevant memories: ' . implode('; ', $retrievedBits) . '.';
        }

        $parts[] = self::generateGuidance($message, $storedMemories, $retrievedMemories);

        return implode(' ', array_filter($parts));
    }

    private static function generateGuidance(
        string $message,
        array $storedMemories,
        array $retrievedMemories
    ): string {
        $lower = strtolower($message);

        if (preg_match('/\b(help|plan|schedule|next step|what should i do|how do i)\b/i', $message)) {
            $context = self::bestMemorySnippet($storedMemories, $retrievedMemories);
            if ($context !== null) {
                return 'Based on that context, the best next step is to break it into one immediate action, one follow-up action, and one checkpoint. Start with: ' . $context;
            }

            return 'A good next move is to define one concrete outcome, one deadline, and one small first action so I can keep helping consistently.';
        }

        if (preg_match('/\bremember|recall|what do you know|what do you remember)\b/i', $message)) {
            if ($retrievedMemories === []) {
                return 'I do not have much stored yet, but I will start building a profile from the details you share.';
            }

            return 'That is the key context I currently remember and can reuse in later conversations.';
        }

        if ($storedMemories !== []) {
            return 'You can keep talking naturally, and I will keep building a more useful memory profile from important details like preferences, goals, and commitments.';
        }

        if (strpos($lower, '?') !== false) {
            return 'I can answer more precisely if you share a little personal context, such as your goal, preference, or deadline, so I can remember it for later.';
        }

        return 'I have saved the important context I could detect and will use it to personalize future responses.';
    }

    private static function bestMemorySnippet(array $storedMemories, array $retrievedMemories): ?string
    {
        $memory = $storedMemories[0] ?? $retrievedMemories[0] ?? null;
        if ($memory === null) {
            return null;
        }

        return $memory['summary_text'];
    }

    private static function extractKeywords(string $message): array
    {
        $normalized = strtolower($message);
        $parts = preg_split('/[^a-z0-9]+/', $normalized) ?: [];
        $keywords = [];

        foreach ($parts as $part) {
            if ($part === '' || strlen($part) < 3 || in_array($part, self::STOP_WORDS, true)) {
                continue;
            }

            $keywords[$part] = true;
        }

        return array_keys($keywords);
    }

    private static function inferPriorityTypes(string $message): array
    {
        $message = strtolower($message);
        $types = ['context'];

        if (preg_match('/\b(goal|target|achieve|deadline|plan)\b/', $message)) {
            $types[] = 'goals';
        }

        if (preg_match('/\b(prefer|favorite|like|love)\b/', $message)) {
            $types[] = 'profile';
        }

        if (preg_match('/\b(remind|will|need to|must)\b/', $message)) {
            $types[] = 'commitments';
        }

        return array_values(array_unique($types));
    }

    private static function cleanMemorySummary(string $summary, string $memoryType, string $lower): string
    {
        $summary = trim(preg_replace('/\s+/', ' ', $summary) ?? '');
        $summary = rtrim($summary, '.!?');

        if ($memoryType === 'profile' && preg_match('/^(i am|i\'m)\s+/i', $summary) && !preg_match('/^(i am trying|i am planning)/i', $summary)) {
            return $summary;
        }

        if ($memoryType === 'goals' && strpos($lower, 'my goal is') === 0) {
            return ucfirst($summary);
        }

        return ucfirst($summary);
    }

    private static function normalizeText(string $value): string
    {
        return trim(preg_replace('/\s+/', ' ', $value) ?? '');
    }

    private static function truncatePreview(string $value, int $maxLength = 255): string
    {
        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $maxLength);
        }

        return substr($value, 0, $maxLength);
    }

    private static function defaultThreadTitle(): string
    {
        return 'CognitiveOS Memory Thread';
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
        error_log('[ChatController] ' . $exception->getMessage());

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
