<?php

namespace App\Services\Database;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class SupabaseClient
{
    protected string $url;
    protected string $serviceRoleKey;
    protected Client $httpClient;

    public function __construct()
    {
        $this->url = config('services.supabase.url', env('SUPABASE_URL'));
        $this->serviceRoleKey = config('services.supabase.service_role_key', env('SUPABASE_SERVICE_ROLE_KEY'));
        $this->httpClient = new Client([
            'base_uri' => $this->url,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->serviceRoleKey,
                'apikey' => $this->serviceRoleKey,
            ],
        ]);
    }

    public function table(string $table): SupabaseQueryBuilder
    {
        return new SupabaseQueryBuilder($this->httpClient, $this->url, $table);
    }
}

class SupabaseQueryBuilder
{
    protected Client $httpClient;
    protected string $url;
    protected string $table;
    protected array $selects = [];
    protected array $filters = [];
    protected ?int $limit = null;
    protected array $orderBy = [];
    protected array $values = [];

    public function __construct(Client $httpClient, string $url, string $table)
    {
        $this->httpClient = $httpClient;
        $this->url = $url;
        $this->table = $table;
    }

    public function select(string $columns = '*'): self
    {
        $this->selects[] = $columns;
        return $this;
    }

    public function where(string $column, string $operator, mixed $value): self
    {
        // PostgREST filter format: column=operator.value (e.g. ?user_id=eq.123)
        $this->filters[$column] = $operator . '.' . urlencode((string) $value);
        return $this;
    }

    public function limit(int $limit): self
    {
        $this->limit = $limit;
        return $this;
    }

    public function orderBy(string $column, string $direction = 'desc'): self
    {
        $this->orderBy[] = "$column:$direction";
        return $this;
    }

    public function insert(array $data): array
    {
        try {
            $uri = "/rest/v1/{$this->table}";
            $response = $this->httpClient->post($uri, ['json' => $data]);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (\Throwable $e) {
            Log::error('SupabaseClient::insert failed: ' . $e->getMessage(), ['table' => $this->table]);
            return [];
        }
    }

    public function update(array $data): array
    {
        try {
            $uri = "/rest/v1/{$this->table}";
            $response = $this->httpClient->patch($uri, ['json' => $data]);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (\Throwable $e) {
            Log::error('SupabaseClient::update failed: ' . $e->getMessage(), ['table' => $this->table]);
            return [];
        }
    }

    public function get(): array
    {
        $params = [];
        if (!empty($this->selects)) {
            $params['select'] = implode(',', $this->selects);
        }
        if ($this->limit) {
            $params['limit'] = $this->limit;
        }
        if (!empty($this->orderBy)) {
            $params['order'] = implode(',', $this->orderBy);
        }
        // PostgREST filters are individual query params (column=operator.value)
        $params = array_merge($params, $this->filters);
        try {
            $uri = "/rest/v1/{$this->table}?" . http_build_query($params);
            $response = $this->httpClient->get($uri);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (\Throwable $e) {
            Log::error('SupabaseClient::get failed: ' . $e->getMessage(), [
                'table' => $this->table,
                'params' => $params,
            ]);
            return [];
        }
    }
}
