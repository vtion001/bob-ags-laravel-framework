<?php

namespace App\Services\CTM;

class AgentsService
{
    protected Client $client;

    public function __construct(?Client $client = null)
    {
        $this->client = $client ?? new Client();
    }

    /**
     * Get all agents with pagination
     */
    public function getAgents(): array
    {
        $allAgents = [];
        $page = 1;
        $perPage = 100;

        do {
            $endpoint = "/accounts/{$this->client->getAccountId()}/agents.json?page={$page}&per_page={$perPage}";
            $response = $this->client->get($endpoint);

            if (empty($response)) {
                break;
            }

            // CTM returns {"page":1,"per_page":100,"total_entries":198,"agents":[...]}
            $agents = $response['agents'] ?? $response;
            if (empty($agents)) {
                break;
            }

            $allAgents = array_merge($allAgents, $agents);
            $page++;

            // Stop if we got fewer than perPage (last page)
        } while (count($agents) >= $perPage);

        return $allAgents;
    }

    /**
     * Get user groups
     */
    public function getUserGroups(): array
    {
        $endpoint = "/accounts/{$this->client->getAccountId()}/user_groups.json";
        return $this->client->get($endpoint);
    }
}
