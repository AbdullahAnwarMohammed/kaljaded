<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        $locale = session('locale', config('app.locale'));
        App::setLocale($locale);

        return $next($request);
    }
}
