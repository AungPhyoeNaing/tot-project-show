<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://172.10.2.173:5173',
        'http://totumdy.com',
        'https://totumdy.com',
        'http://www.totumdy.com',
        'https://www.totumdy.com',
        'http://api.totumdy.com',
        'https://api.totumdy.com',
        'http://chat.totumdy.com',
        'https://chat.totumdy.com',
    ],

    'allowed_origins_patterns' => [
        '#^https?://(localhost|127\.0\.0\.1|172\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$#',
        '#^https?://([a-zA-Z0-9-]+\.)?totumdy\.com(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
