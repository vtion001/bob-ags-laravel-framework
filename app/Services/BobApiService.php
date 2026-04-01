<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class BobApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.bob_api.url', env('BOB_API_URL', 'http://localhost:8080'));
        $this->apiKey = config('services.bob_api.key', env('BOB_API_KEY', ''));
    }

    /**
     * Get the Bearer token for authenticated requests
     */
    protected function getToken(): ?string
    {
        // Check for Sanctum token ID in session, then find the plain text token
        if (Session::has('bob_api_token_id') && auth()->check()) {
            $tokenId = Session::get('bob_api_token_id');
            $token = auth()->user()->tokens()->where('id', $tokenId)->first();
            return $token?->plainTextToken;
        }

        // Fallback: try current access token
        if (auth()->check()) {
            return auth()->user()->currentAccessToken()?->token;
        }

        return null;
    }

    /**
     * Make authenticated GET request to bob-ags-api
     */
    public function get(string $endpoint, array $query = []): array
    {
        $response = Http::withHeaders([
                'X-Api-Key' => $this->apiKey,
            ])
            ->timeout(30)
            ->get("{$this->baseUrl}/api/{$endpoint}", $query);

        return $this->handleResponse($response);
    }

    /**
     * Make authenticated POST request to bob-ags-api
     */
    public function post(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders([
                'X-Api-Key' => $this->apiKey,
            ])
            ->timeout(60)
            ->post("{$this->baseUrl}/api/{$endpoint}", $data);

        return $this->handleResponse($response);
    }

    /**
     * Make authenticated PUT request to bob-ags-api
     */
    public function put(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders([
                'X-Api-Key' => $this->apiKey,
            ])
            ->timeout(30)
            ->put("{$this->baseUrl}/api/{$endpoint}", $data);

        return $this->handleResponse($response);
    }

    /**
     * Make authenticated DELETE request to bob-ags-api
     */
    public function delete(string $endpoint): array
    {
        $response = Http::withHeaders([
                'X-Api-Key' => $this->apiKey,
            ])
            ->timeout(30)
            ->delete("{$this->baseUrl}/api/{$endpoint}");

        return $this->handleResponse($response);
    }

    /**
     * Handle HTTP response
     */
    protected function handleResponse($response): array
    {
        if ($response->successful()) {
            return $response->json() ?? ['success' => true];
        }

        $status = $response->status();
        $body = $response->json();

        if ($status === 401) {
            throw new \App\Exceptions\UnauthorizedException('Session expired. Please login again.');
        }

        if ($status === 404) {
            return ['error' => $body['error'] ?? 'Resource not found', 'status' => 404];
        }

        if ($status >= 500) {
            throw new \App\Exceptions\ServerException('Backend server error. Please try again later.');
        }

        return [
            'error' => $body['error'] ?? 'Request failed',
            'status' => $status,
        ];
    }
}