<?php

namespace App\Livewire\Dashboard;

use App\Services\BobApiService;
use Livewire\Component;

class CallShow extends Component
{
    public ?array $call = null;
    public ?string $error = null;
    public string $callId;

    protected BobApiService $bobApi;

    public function boot(BobApiService $bobApi)
    {
        $this->bobApi = $bobApi;
    }

    public function mount(string $callId)
    {
        $this->callId = $callId;
        $this->loadCall();
    }

    public function loadCall()
    {
        try {
            $response = $this->bobApi->get("calls/{$this->callId}");
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }
            $this->call = $response['call'] ?? null;
        } catch (\Exception $e) {
            $this->error = 'Failed to load call: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.call-show');
    }
}
