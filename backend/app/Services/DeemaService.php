<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class DeemaService 
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.deema.api_key');
        $this->baseUrl = config('services.deema.use_sandbox')
            ? config('services.deema.sandbox_url')
            : config('services.deema.live_url');
    }
    protected function headers(): array
    {
        return [
            'Authorization' => 'Basic ' . $this->apiKey,
            'Accept'        => 'application/json',
        ];
    }

public function createOrder(array $data)
{
    try {
        return Http::withHeaders($this->headers())
            ->post($this->baseUrl . "/api/merchant/v1/purchase", $data)
            ->throw()
            ->json();
    } catch (\Throwable $e) {
        return [
            'success' => false,
            'message' => $e->getMessage(),
        ];
    }
}
    public function getOrderStatus(string $orderReference)
    {
        $url = $this->baseUrl . "/api/merchant/v1/purchase/status?order_reference={$orderReference}";

        return Http::withHeaders($this->headers())
            ->get($url)
            ->json();
    }

    public function retrieveOrder(string $orderReference)
    {
        $url = $this->baseUrl . "/api/merchant/v1/purchase/{$orderReference}/retrieve_by_reference";

        return Http::withHeaders($this->headers())
            ->get($url)
            ->json();
    }
}
