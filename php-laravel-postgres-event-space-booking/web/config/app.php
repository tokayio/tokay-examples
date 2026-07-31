<?php

return [
    'name' => env('APP_NAME', 'Open Door Rooms'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'America/New_York',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [],
    'admin_password' => env('ADMIN_PASSWORD', ''),
    'maintenance' => ['driver' => 'file', 'store' => 'array'],
];
