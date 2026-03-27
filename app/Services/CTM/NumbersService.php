<?php

namespace App\Services\CTM;

class NumbersService
{
    protected Client $client;

    public function __construct(?Client $client = null)
    {
        $this->client = $client ?? new Client();
    }

    /**
     * Get all tracking numbers (sources)
     */
    public function getNumbers(): array
    {
        $endpoint = "/accounts/{$this->client->getAccountId()}/sources.json";
        return $this->client->get($endpoint);
    }

    /**
     * Search numbers with optional params
     */
    public function searchNumbers(array $params): array
    {
        $query = http_build_query($params);
        $endpoint = "/accounts/{$this->client->getAccountId()}/numbers.json";
        if ($query) {
            $endpoint .= '?' . $query;
        }
        return $this->client->get($endpoint);
    }

    public function purchaseNumber(string $phoneNumber, bool $test = true): array
    {
        return $this->client->post("/accounts/{$this->client->getAccountId()}/numbers", [
            'phone_number' => $phoneNumber,
            'test' => $test,
        ]);
    }
}