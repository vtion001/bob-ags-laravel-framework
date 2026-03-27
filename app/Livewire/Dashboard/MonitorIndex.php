<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class MonitorIndex extends Component
{
    public Collection $activeCalls;
    public ?string $selectedCallId = null;
    public ?array $selectedCallData = null;
    public ?string $error = null;
    public bool $isMonitoring = false;
    public Collection $groups;

    public array $liveState = [
        'transcript' => [],
        'callerName' => null,
        'callerPhone' => null,
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
        $this->activeCalls = collect([]);
        $this->groups = collect([]);
        $this->loadActiveCalls();
    }

    public function loadActiveCalls()
    {
        try {
            $response = $this->fastApi->get('ctm/active-calls', ['status' => 'in_progress']);
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $calls = $response['data']['calls'] ?? $response['calls'] ?? [];
            $calls = $this->agentProfileService->filterCallsByProfile($calls);
            $this->activeCalls = collect($calls);
            $this->groups = $this->activeCalls->pluck('group')->filter()->unique()->values();
        } catch (\Exception $e) {
            $this->error = 'Failed to load calls: ' . $e->getMessage();
        }
    }

    public function selectCall(string $callId)
    {
        $this->selectedCallId = $callId;
        $this->selectedCallData = $this->activeCalls->firstWhere('id', $callId);
    }

    public function startMonitoring() { $this->isMonitoring = true; }
    public function stopMonitoring() { $this->isMonitoring = false; }

    public function render()
    {
        return view('livewire.dashboard.monitor-index');
    }
}
