<?php

use Monolog\Handler\StreamHandler;

return [
    'default' => 'stderr',
    'deprecations' => ['channel' => 'null', 'trace' => false],
    'channels' => [
        'stderr' => [
            'driver' => 'monolog',
            'level' => 'info',
            'handler' => StreamHandler::class,
            'handler_with' => ['stream' => 'php://stderr'],
        ],
        'null' => ['driver' => 'monolog', 'handler' => Monolog\Handler\NullHandler::class],
        'emergency' => ['path' => storage_path('logs/laravel.log')],
    ],
];
