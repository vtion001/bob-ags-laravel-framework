<?php

namespace App\Services\CTM;

use GuzzleHttp\Client as HttpClient;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class Client
{
    protected string $accessKey;
    protected string $secretKey;
    protected string $accountId;
    protected string $baseUrl = 'https://api.calltrackingmetrics.com/api/v1';
    protected HttpClient $httpClient;

    public function __construct()
    {
        $this->accessKey = config('services.ctm.access_key', env('CTM_ACCESS_KEY', ''));
        $this->secretKey = config('services.ctm.secret_key', env('CTM_SECRET_KEY', ''));
        $this->accountId = config('services.ctm.account_id', env('CTM_ACCOUNT_ID', ''));
        $this->httpClient = new HttpClient(['timeout' => 30]);
    }

    protected function getAuthHeader(): string
    {
        return base64_encode($this->accessKey . ':' . $this->secretKey);
    }

    protected function getHeaders(): array
    {
        return [
            'Authorization' => 'Basic ' . $this->getAuthHeader(),
            'Content-Type' => 'application/json',
        ];
    }

    public function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;
        try {
            $options = ['headers' => $this->getHeaders()];
            if (!empty($data) && in_array($method, ['POST', 'PUT', 'PATCH'])) {
                $options['json'] = $data;
            }
            $response = $this->httpClient->request($method, $url, $options);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (GuzzleException $e) {
            Log::error('CTM API error: ' . $e->getMessage());
            throw new \Exception('CTM API error: ' . $e->getMessage());
        }
    }

    public function get(string $endpoint): array
    {
        return $this->makeRequest('GET', $endpoint);
    }

    public function post(string $endpoint, array $data = []): array
    {
        return $this->makeRequest('POST', $endpoint, $data);
    }

    public function getAccountId(): string
    {
        return $this->accountId;
    }
}
