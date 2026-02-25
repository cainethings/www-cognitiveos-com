<?php

declare(strict_types=1);

namespace App;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->map('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->map('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->map('PUT', $path, $handler);
    }

    public function patch(string $path, callable $handler): void
    {
        $this->map('PATCH', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->map('DELETE', $path, $handler);
    }

    public function map(string $method, string $path, callable $handler): void
    {
        $normalized = $this->normalizePath($path);
        $this->routes[$method][$normalized] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $path = $this->normalizePath($path);

        $handler = $this->routes[$method][$path] ?? null;
        if ($handler === null) {
            Response::json(['error' => 'Not Found'], 404);
            return;
        }

        $result = call_user_func($handler);
        if ($result !== null) {
            Response::json($result);
        }
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }
}
