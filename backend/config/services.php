<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'deema' => [
        'sandbox_url' => env('DEEMA_SANDBOX_URL', 'https://sandbox-api.deema.me'),
        'live_url'    => env('DEEMA_LIVE_URL', 'https://api.deema.me'),
        'api_key'     => env('DEEMA_API_KEY'),
        'use_sandbox' => env('DEEMA_USE_SANDBOX', false),
    ],

    'myfatoorah' => [
    'api_key' => env('MYFATOORAH_API_KEY'),
    'use_sandbox' => env('MYFATOORAH_USE_SANDBOX', false),
    'sandbox_url' => env('MYFATOORAH_SANDBOX_URL'),
    'live_url' => env('MYFATOORAH_LIVE_URL'),
],






    'wasender' => [
        'base_url' => env('WASENDER_BASE_URL', 'https://wasenderapi.com/api'),
        'api_key'  => env('WASENDER_API_KEY'),
    ],

    'firebase' => [
        'key' => env('FCM_SERVER_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

];
