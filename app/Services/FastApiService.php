<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FastApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.fastapi.url', env('FASTAPI_URL', 'http://localhost:8000'));
    }

    /**
     * Make a GET request to FastAPI
     */
    public function get(string $endpoint, array $query = []): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/api/{$endpoint}", $query);
            if ($response->successful()) {
                return $response->json() ?? ['success' => true];
            }
            Log::error('FastAPI error: ' . $response->status() . ' - ' . $response->body());
            return ['error' => 'FastAPI request failed: ' . $response->status(), 'status' => $response->status()];
        } catch (\Exception $e) {
            Log::error('FastAPI exception: ' . $e->getMessage());
            return ['error' => 'FastAPI unavailable: ' . $e->getMessage()];
        }
    }

    /**
     * Trigger a background sync job
     */
    public function triggerSync(): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/api/sync/trigger");
            if ($response->successful()) {
                return $response->json();
            }
            return ['error' => 'Failed to trigger sync', 'status' => $response->status()];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get sync job status
     */
    public function getSyncStatus(string $jobId): array
    {
        try {
            $response = Http::timeout(10)->get("{$this->baseUrl}/api/sync/status/{$jobId}");
            if ($response->successful()) {
                return $response->json();
            }
            return ['error' => 'Job not found', 'status' => $response->status()];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Invalidate cache for a prefix
     */
    public function invalidateCache(string $prefix): array
    {
        try {
            $response = Http::timeout(10)->delete("{$this->baseUrl}/api/sync/cache/{$prefix}");
            return $response->successful() ? ['success' => true] : ['error' => 'Failed'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}