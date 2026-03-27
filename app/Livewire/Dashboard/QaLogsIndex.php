<?php

namespace App\Livewire\Dashboard;

use App\Services\BobApiService;
use Livewire\Component;
use Illuminate\Support\Collection;

class QaLogsIndex extends Component
{
    public Collection $qaLogs;
    public ?string $error = null;
    public array $filters = [
        'search' => '',
        'date_from' => '',
        'date_to' => '',
        'agent_id' => '',
    ];

    protected BobApiService $bobApi;

    public function boot(BobApiService $bobApi)
    {
        $this->bobApi = $bobApi;
    }

    public function mount()
    {
        $this->qaLogs = collect([]);
        $this->loadQaLogs();
    }

    public function loadQaLogs()
    {
        try {
            $response = $this->bobApi->get('qa-overrides', $this->filters);
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }
            // API returns data wrapped in 'data' key: {"success":true,"data":{"qa_overrides":[...]}}
            $qaOverrides = $response['data']['qa_overrides'] ?? $response['qa_overrides'] ?? [];
            $this->qaLogs = collect($qaOverrides);
        } catch (\Exception $e) {
            $this->error = 'Failed to load QA logs: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.qa-logs-index');
    }
}
