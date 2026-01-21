<?php

namespace App\Traits;

use Illuminate\Support\Facades\App;

trait ApiResponseTrait
{

    protected function successResponse($data = null, ?string $messageKey = null, int $status = 200, array $replace = [])
    {
        $locale = App::getLocale();
        $message = $messageKey ? __($messageKey, $replace, $locale) : null;

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }
    protected function errorResponse(?string $messageKey = null, int $status = 400, array $replace = [])
    {
        $locale = App::getLocale();
        $message = $messageKey ? __($messageKey, $replace, $locale) : null;

        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
