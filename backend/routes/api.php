<?php

declare(strict_types=1);

use App\Router;
use App\Controllers\ChatController;
use App\Controllers\HealthController;
use App\Controllers\StarterController;

return function (Router $router): void {
    $router->get('/health', [HealthController::class, 'show']);
    $router->get('/info', [StarterController::class, 'info']);
    $router->post('/chat', [ChatController::class, 'handle']);
    $router->post('/echo', [StarterController::class, 'echo']);
};
