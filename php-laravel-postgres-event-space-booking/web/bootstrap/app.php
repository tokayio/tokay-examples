<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

foreach ([
    __DIR__.'/cache',
    dirname(__DIR__).'/storage/framework/cache/data',
    dirname(__DIR__).'/storage/framework/sessions',
    dirname(__DIR__).'/storage/framework/views',
    dirname(__DIR__).'/storage/logs',
] as $directory) {
    if (!is_dir($directory)) {
        mkdir($directory, 0775, true);
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Laravel's default exception rendering is enough for this small app.
    })->create();
