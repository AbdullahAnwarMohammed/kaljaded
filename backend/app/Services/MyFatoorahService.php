<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MyFatoorahService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.myfatoorah.api_key') ?? '';
        $useSandbox = config('services.myfatoorah.use_sandbox');
        if ($useSandbox) {
            $this->baseUrl = config('services.myfatoorah.sandbox_url') ?? 'https://apitest.myfatoorah.com';
        } else {
            $this->baseUrl = config('services.myfatoorah.live_url') ?? 'https://api.myfatoorah.com';
        }
    }

    protected function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json',
        ];
    }

    /**
     * Send Payment Request (Initiate)
     */
    public function sendPayment(array $data)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . "/v2/SendPayment", $data);

            if ($response->failed()) {
                Log::error('MyFatoorah SendPayment Failed', ['body' => $response->body()]);
                return $response->json(); 
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('MyFatoorah SendPayment Error', ['error' => $e->getMessage()]);
            return ['IsSuccess' => false, 'Message' => $e->getMessage()];
        }
    }

    /**
     * Get Payment Status
     */
    public function getPaymentStatus(string $paymentId)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . "/v2/getPaymentStatus", [
                    'KeyType' => 'paymentId',
                    'Key'     => $paymentId,
                ]);
            if ($response->failed()) {
                Log::error('MyFatoorah GetPaymentStatus Failed', ['body' => $response->body()]);
                return $response->json();
            }
            return $response->json();
        } catch (\Throwable $e) {
            Log::error('MyFatoorah GetPaymentStatus Error', ['error' => $e->getMessage()]);
            return ['IsSuccess' => false, 'Message' => $e->getMessage()];
        }
    }
    /**
     * Initiate Payment to get available methods
     */
    // KWD
    public function initiatePayment(float $invoiceAmount, string $currencyIso = 'KWD')
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . "/v2/InitiatePayment", [
                    'InvoiceAmount' => $invoiceAmount,
                    'CurrencyIso'   => $currencyIso,
                ]);


                Log::info('MF Initiate Request', [
    'url' => $this->baseUrl . "/v2/InitiatePayment",
    'headers' => $this->headers(),
    'body' => [
        'InvoiceAmount' => $invoiceAmount,
        'CurrencyIso' => $currencyIso,
    ]
]);

            if ($response->failed()) {
     
                Log::error('MyFatoorah InitiatePayment Failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                    'json'   => $response->json(),
                ]);
                return $response->json();
            }
            return $response->json();
        } catch (\Throwable $e) {
            Log::error('MyFatoorah InitiatePayment Error', ['error' => $e->getMessage()]);
            return ['IsSuccess' => false, 'Message' => $e->getMessage()];
        }
    }
    
    /**
     * Execute Payment (Direct Payment Method Selection)
     */
    public function executePayment(array $data)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . "/v2/ExecutePayment", $data);

            if ($response->failed()) {
                Log::error('MyFatoorah ExecutePayment Failed', ['body' => $response->body()]);
                return $response->json();
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('MyFatoorah ExecutePayment Error', ['error' => $e->getMessage()]);
            return ['IsSuccess' => false, 'Message' => $e->getMessage()];
        }
    }
}
