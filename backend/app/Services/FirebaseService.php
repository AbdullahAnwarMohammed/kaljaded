<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FirebaseService
{
    protected $credentialsData;
    protected $projectId;

    public function __construct()
    {
        // Load credentials from the JSON file we saved
        $path = storage_path('app/firebase_credentials.json');
        if (file_exists($path)) {
            $this->credentialsData = json_decode(file_get_contents($path), true);
            $this->projectId = $this->credentialsData['project_id'] ?? null;
        } else {
            Log::error('Firebase credentials file not found at: ' . $path);
        }
    }

    /**
     * Get OAuth2 Access Token
     */
    protected function getAccessToken()
    {
        return Cache::remember('firebase_access_token', 3500, function () {
            if (!$this->credentialsData) {
                return null;
            }

            $clientEmail = $this->credentialsData['client_email'];
            $privateKey = $this->credentialsData['private_key'];
            $tokenUri = $this->credentialsData['token_uri'];

            // Header
            $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);

            // Claim Set
            $now = time();
            $claimSet = json_encode([
                'iss' => $clientEmail,
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => $tokenUri,
                'exp' => $now + 3600,
                'iat' => $now,
            ]);

            // Base64 Url Encode
            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlClaimSet = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claimSet));

            // Sign
            $signature = '';
            openssl_sign($base64UrlHeader . "." . $base64UrlClaimSet, $signature, $privateKey, 'SHA256');
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

            $jwt = $base64UrlHeader . "." . $base64UrlClaimSet . "." . $base64UrlSignature;

            // Request Access Token
            $response = Http::asForm()->post($tokenUri, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            Log::error('Failed to get Firebase Access Token: ' . $response->body());
            return null;
        });
    }

    /**
     * Send notification to multiple tokens using HTTP v1 API
     *
     * @param array $tokens
     * @param string $title
     * @param string $body
     * @param array $data
     * @return void
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = [])
    {
        if (empty($tokens)) {
            return;
        }

        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            Log::error('Cannot send notification: No access token.');
            return;
        }

        if (!$this->projectId) {
             Log::error('Cannot send notification: No Project ID.');
             return;
        }

        $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

        foreach ($tokens as $token) {
            $message = [
                'token' => $token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                // Android specific
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                            'sound' => 'default'
                    ]
                ],
                    // iOS specific
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'sound' => 'default'
                        ]
                    ]
                ]
            ];

            if (!empty($data)) {
                $message['data'] = array_map('strval', $data);
            }

            $payload = ['message' => $message];

            try {
                // Send individually (HTTP v1 doesn't support multicast 'registration_ids' like legacy)
                // For bulk sending, you'd typically use topics or batch requests (but batch is also limited/deprecated in some contexts).
                // For now, looping is acceptable for small numbers.
                $response = Http::withToken($accessToken)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, $payload);

                if (!$response->successful()) {
                    Log::error("Firebase notification failed for token {$token}: " . $response->body());
                } else {
                     // Log::info("Firebase notification sent to {$token}");
                }

            } catch (\Exception $e) {
                Log::error('Firebase notification exception: ' . $e->getMessage());
            }
        }
    }
}
