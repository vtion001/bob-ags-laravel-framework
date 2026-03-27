<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class AgentsIndex extends Component
{
    public Collection $agents;
    public ?string $error = null;

    protected FastApiService $fastApi;
    protected AgentProfileService $agentProfileService;

    public function boot(FastApiService $fastApi, AgentProfileService $agentProfileService)
    {
        $this->fastApi = $fastApi;
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->agents = collect([]);
        $this->loadAgents();
    }

    public function loadAgents()
    {
        try {
            // Fetch from FastAPI (which has Redis cache + CTM)
            $response = $this->fastApi->get('ctm/agents');
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $agents = $response['data']['agents'] ?? $response['agents'] ?? [];
            // Filter to AgentProfile names
            $agents = $this->agentProfileService->filterCallsByProfile($agents);
            $this->agents = collect($agents);
        } catch (\Exception $e) {
            $this->error = 'Failed to load agents: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.agents-index');
    }
}
