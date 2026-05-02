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
        $this->routes[$method][] = [
            'path' => $normalized,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $path = $this->normalizePath($path);

        [$handler, $params] = $this->match($method, $path);
        if ($handler === null) {
            Response::json(['error' => 'Not Found'], 404);
            return;
        }

        $result = $params === []
            ? call_user_func($handler)
            : call_user_func($handler, $params);
        if ($result !== null) {
            Response::json($result);
        }
    }

    private function match(string $method, string $path): array
    {
        foreach ($this->routes[$method] ?? [] as $route) {
            $params = $this->extractParams($route['path'], $path);
            if ($params === null) {
                continue;
            }

            return [$route['handler'], $params];
        }

        return [null, []];
    }

    private function extractParams(string $routePath, string $requestPath): ?array
    {
        if ($routePath === $requestPath) {
            return [];
        }

        $routeSegments = explode('/', trim($routePath, '/'));
        $requestSegments = explode('/', trim($requestPath, '/'));

        if (count($routeSegments) !== count($requestSegments)) {
            return null;
        }

        $params = [];

        foreach ($routeSegments as $index => $routeSegment) {
            $requestSegment = $requestSegments[$index] ?? '';

            if (
                preg_match('/^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/', $routeSegment, $matches)
            ) {
                $params[$matches[1]] = $requestSegment;
                continue;
            }

            if ($routeSegment !== $requestSegment) {
                return null;
            }
        }

        return $params;
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }
}
