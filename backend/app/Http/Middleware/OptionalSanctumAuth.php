<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            if ($token) {
                auth()->login($token->tokenable);
            }
        }

        return $next($request);
    }
}
