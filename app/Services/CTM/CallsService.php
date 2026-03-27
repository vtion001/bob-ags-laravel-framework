<?php

namespace App\Services\CTM;

class CallsService
{
    protected Client $client;

    public function __construct(?Client $client = null)
    {
        $this->client = $client ?? new Client();
    }

    /**
     * Get calls with optional filtering params
     */
    public function getCalls(array $params = []): array
    {
        $query = http_build_query($params);
        $endpoint = "/accounts/{$this->client->getAccountId()}/calls.json";
        if ($query) {
            $endpoint .= '?' . $query;
        }
        $response = $this->client->get($endpoint);
        // CTM returns {"calls": [...]} for list calls
        return is_array($response) && isset($response['calls']) ? $response['calls'] : $response;
    }

    /**
     * Get all calls with pagination
     */
    public function getAllCalls(array $params = []): array
    {
        $allCalls = [];
        $page = 1;
        $perPage = $params['per_page'] ?? 100;

        do {
            $params['page'] = $page;
            $params['per_page'] = $perPage;
            $response = $this->getCalls($params);

            if (empty($response)) {
                break;
            }

            $allCalls = array_merge($allCalls, $response);
            $page++;
        } while (count($response) === $perPage);

        return $allCalls;
    }

    /**
     * Get a specific call by ID
     */
    public function getCall(string $callId): ?array
    {
        try {
            $endpoint = "/accounts/{$this->client->getAccountId()}/calls/{$callId}.json";
            return $this->client->get($endpoint);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get call transcript
     */
    public function getCallTranscript(string $callId): string
    {
        try {
            $endpoint = "/accounts/{$this->client->getAccountId()}/calls/{$callId}/transcript";
            $response = $this->client->get($endpoint);
            return is_string($response) ? $response : ($response['transcript'] ?? '');
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Search calls by phone number
     */
    public function searchCallsByPhone(string $phone, int $hours = 8760): array
    {
        $params = [
            'phone_number' => $phone,
            'hours' => $hours,
        ];
        return $this->getCalls($params);
    }

    /**
     * Get recent calls (most recent first)
     */
    public function getRecentCalls(int $limit = 5): array
    {
        $params = [
            'per_page' => $limit,
            'order_by' => 'start_time',
            'order_dir' => 'desc',
        ];
        return $this->getCalls($params);
    }
}
