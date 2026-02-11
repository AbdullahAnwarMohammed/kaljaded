<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WaSenderApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.wasender.base_url');
        $this->apiKey = config('services.wasender.api_key');
    }

    public function sendTextMessage(string $to, string $message)
    {
        $response = Http::timeout(10)->withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->post("{$this->baseUrl}/send-message", [
            'to'   => $to,
            'text' => $message,
        ]);

        return $response->json();
    }
}
