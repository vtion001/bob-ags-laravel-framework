<?php

namespace App\Livewire\Dashboard;

use App\Models\AgentProfile;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class AgentProfilesIndex extends Component
{
    public Collection $profiles;
    public ?string $error = null;
    public bool $isSyncing = false;

    protected AgentProfileService $agentProfileService;

    public function boot(AgentProfileService $agentProfileService)
    {
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->loadProfiles();
    }

    public function loadProfiles()
    {
        $this->profiles = AgentProfile::orderBy('name')->get();
    }

    public function syncFromCtm()
    {
        try {
            $this->isSyncing = true;
            $result = $this->agentProfileService->syncFromCtm();
            $this->loadProfiles();
            session()->flash('message', "Synced: {$result['synced']} updated, {$result['created']} created.");
        } catch (\Exception $e) {
            $this->error = 'Sync failed: ' . $e->getMessage();
        } finally {
            $this->isSyncing = false;
        }
    }

    public function deleteProfile(int $id)
    {
        AgentProfile::destroy($id);
        $this->loadProfiles();
    }

    public function render()
    {
        return view('livewire.dashboard.agent-profiles-index');
    }
}
