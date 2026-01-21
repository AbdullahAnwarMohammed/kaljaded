<?php

use App\Http\Middleware\OptionalSanctumAuth;
use App\Http\Middleware\SetLanguageFromHeader;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'laravel/api',

    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'setLocale' => SetLocale::class,
            'SetLanguageFromHeader' => SetLanguageFromHeader::class,
            'optional.sanctum' => OptionalSanctumAuth::class,

        ]);
    })


    ->withExceptions(function (Exceptions $exceptions) {

        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });


        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => __('messages.validation_error'),
                'errors'  => $e->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => __('messages.unauthenticated'),
            ], 401);
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => __('messages.not_found'),
            ], 404);
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: __('messages.server_error'),
            ], 500);
        });
    })

    ->create();
