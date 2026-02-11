<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLanguageFromHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $language = $request->header('language', 'ar');
        if (empty($language)) {
            return response()->json([
                'success' => false,
                'message' => 'Language header is required and cannot be empty.'
            ], 400);
        }
        App::setLocale($language);
        $request->attributes->set('language', $language);
        return $next($request);
    }
}

