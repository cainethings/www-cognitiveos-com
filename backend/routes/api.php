<?php

declare(strict_types=1);

use App\Router;
use App\Controllers\ChatController;
use App\Controllers\HealthController;
use App\Controllers\MemoryController;
use App\Controllers\StarterController;

return function (Router $router): void {
    $router->get('/health', [HealthController::class, 'show']);
    $router->get('/info', [StarterController::class, 'info']);
    $router->get('/conversations', [ChatController::class, 'listConversations']);
    $router->get('/memories', [MemoryController::class, 'list']);
    $router->post('/chat', [ChatController::class, 'handle']);
    $router->delete('/memories/{id}', [MemoryController::class, 'delete']);
    $router->post('/echo', [StarterController::class, 'echo']);
};
