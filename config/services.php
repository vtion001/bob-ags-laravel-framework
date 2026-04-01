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

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bob_api' => [
        'url' => env('BOB_API_URL', 'http://localhost:8080'),
        'key' => env('BOB_API_KEY', ''),
    ],

    'ctm' => [
        'access_key' => env('CTM_ACCESS_KEY', ''),
        'secret_key' => env('CTM_SECRET_KEY', ''),
        'account_id' => env('CTM_ACCOUNT_ID', ''),
    ],

    'supabase' => [
        'url' => env('SUPABASE_URL', ''),
        'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY', ''),
    ],

    'fastapi' => [
        'url' => env('FASTAPI_URL', 'http://localhost:8000'),
    ],

    'assemblyai' => [
        'api_key' => env('ASSEMBLYAI_API_KEY', ''),
    ],

];
