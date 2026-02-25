<?php

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

use App\Router;

$router = new Router();

$routes = require __DIR__ . '/../routes/api.php';
$routes($router);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$path = parse_url($uri, PHP_URL_PATH) ?? '/';
$basePath = getenv('API_BASE_PATH') ?: '/api';

if ($basePath !== '/' && $basePath !== '') {
    if (strpos($path, $basePath) === 0) {
        $path = substr($path, strlen($basePath));
        $path = $path === '' ? '/' : $path;
    }
}

$router->dispatch($method, $path);
