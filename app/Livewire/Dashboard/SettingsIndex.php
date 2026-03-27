<?php

namespace App\Livewire\Dashboard;

use App\Services\BobApiService;
use Livewire\Component;
use Illuminate\Support\Collection;

class SettingsIndex extends Component
{
    public Collection $settings;
    public ?string $error = null;

    protected BobApiService $bobApi;

    public function boot(BobApiService $bobApi)
    {
        $this->bobApi = $bobApi;
    }

    public function mount()
    {
        $this->settings = collect([]);
        $this->loadSettings();
    }

    public function loadSettings()
    {
        try {
            $response = $this->bobApi->get('settings');
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }
            $this->settings = collect($response['settings'] ?? []);
        } catch (\Exception $e) {
            $this->error = 'Failed to load settings: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.settings-index');
    }
}
