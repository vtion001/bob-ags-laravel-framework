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
     * Converts from_date/to_date to start_date/end_date (Unix timestamps) for CTM API
     * IMPORTANT: Returns full response array with 'calls' and 'next_page' keys
     * Use getCallsOnly() if you only need the calls array
     */
    public function getCalls(array $params = []): array
    {
        // Normalize date params: CTM expects start_date/end_date as Unix timestamps
        if (isset($params['from_date'])) {
            $params['start_date'] = $this->dateToUnix($params['from_date']);
            unset($params['from_date']);
        }
        if (isset($params['to_date'])) {
            $params['end_date'] = $this->dateToUnix($params['to_date'], true);
            unset($params['to_date']);
        }

        // Build query — exclude 'after' cursor since it's added separately
        // CTM uses 'per_page' not 'limit'
        $queryParams = array_filter($params, fn($k) => !in_array($k, ['after', 'limit']), ARRAY_FILTER_USE_KEY);
        if (isset($queryParams['limit'])) {
            $queryParams['per_page'] = $queryParams['limit'];
            unset($queryParams['limit']);
        }
        $query = http_build_query($queryParams);
        $endpoint = "/accounts/{$this->client->getAccountId()}/calls.json";
        if ($query) {
            $endpoint .= '?' . $query;
        }

        $response = $this->client->get($endpoint);
        // Return full response — caller can extract calls and next_page
        return is_array($response) ? $response : [];
    }

    /**
     * Get calls only (no pagination) — use when you want just one page
     */
    public function getCallsOnly(array $params = []): array
    {
        $response = $this->getCalls($params);
        return $response['calls'] ?? ($response ?: []);
    }

    /**
     * Convert a date string to Unix timestamp
     * If endOfDay=true, returns timestamp for 23:59:59 of that date
     */
    protected function dateToUnix(string $date, bool $endOfDay = false): int
    {
        $ts = strtotime($date);
        if ($ts === false) {
            // Not a parseable date string — assume it's already a Unix timestamp
            return (int) $date;
        }
        if ($endOfDay) {
            $eod = strtotime('23:59:59', $ts);
            return $eod !== false ? $eod : $ts;
        }
        return $ts;
    }

    /**
     * Extract cursor from next_page URL
     * CTM returns: /accounts/ID/calls.json?after=<cursor>&other=params
     */
    protected function extractCursor(string $nextPage): ?string
    {
        if (empty($nextPage)) {
            return null;
        }
        parse_str(parse_url($nextPage, PHP_URL_QUERY) ?? '', $query);
        return $query['after'] ?? null;
    }

    /**
     * Get ALL calls using cursor-based pagination
     * CTM uses next_page with "after=<cursor>" parameter
     * Automatically pages until no more next_page is returned
     */
    public function getAllCalls(array $params = []): array
    {
        $allCalls = [];
        $perPage = $params['per_page'] ?? 100;
        $cursor = $params['after'] ?? null;
        $maxPages = $params['max_pages'] ?? 500; // safety limit
        $pageCount = 0;

        do {
            $requestParams = array_merge($params, ['per_page' => $perPage]);
            if ($cursor) {
                $requestParams['after'] = $cursor;
            }

            $response = $this->getCalls($requestParams);
            $calls = $response['calls'] ?? [];

            if (empty($calls)) {
                break;
            }

            $allCalls = array_merge($allCalls, $calls);
            $pageCount++;

            // Extract next cursor
            $nextPage = $response['next_page'] ?? null;
            $cursor = $this->extractCursor($nextPage);

            if (!$cursor) {
                break; // No more pages
            }

        } while ($pageCount < $maxPages);

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
    /**
     * Search calls by phone number — fetches first page only
     */
    public function searchCallsByPhone(string $phone, int $hours = 8760): array
    {
        $params = [
            'phone_number' => $phone,
            'hours' => $hours,
        ];
        return $this->getCallsOnly($params);
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
        return $this->getCallsOnly($params);
    }
}
