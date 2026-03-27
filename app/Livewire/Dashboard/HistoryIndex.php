<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class HistoryIndex extends Component
{
    public Collection $calls;
    public ?string $error = null;
    public array $filters = [
        'date_from' => '',
        'date_to' => '',
    ];

    protected FastApiService $fastApi;
    protected AgentProfileService $agentProfileService;

    public function boot(FastApiService $fastApi, AgentProfileService $agentProfileService)
    {
        $this->fastApi = $fastApi;
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->calls = collect([]);
        $this->loadCalls();
    }

    public function loadCalls()
    {
        try {
            $params = array_filter([
                'from_date' => $this->filters['date_from'] ?: null,
                'to_date' => $this->filters['date_to'] ?: null,
            ]);

            $response = $this->fastApi->get('ctm/calls/history', $params);
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $calls = $response['data']['calls'] ?? $response['calls'] ?? [];
            // Filter to AgentProfile agents
            $calls = $this->agentProfileService->filterCallsByProfile($calls);
            $this->calls = collect($calls);
        } catch (\Exception $e) {
            $this->error = 'Failed to load calls: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.history-index');
    }
}
