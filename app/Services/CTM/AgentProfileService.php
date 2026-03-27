<?php

namespace App\Services\CTM;

use App\Models\AgentProfile;

class AgentProfileService
{
    protected CTMFacade $ctm;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
    }

    /**
     * Get all CTM agents, filtered to only AgentProfile names
     */
    public function getFilteredAgents(): array
    {
        $agents = $this->ctm->agents->getAgents();
        $allowedNames = AgentProfile::getNames();

        return array_filter($agents, function ($agent) use ($allowedNames) {
            $name = $agent['name'] ?? $agent['full_name'] ?? '';
            return in_array($name, $allowedNames);
        });
    }

    /**
     * Sync agent profiles from CTM
     * Updates existing records. Only creates new records for names that match the seeder's list.
     */
    public function syncFromCtm(): array
    {
        $agents = $this->ctm->agents->getAgents();
        $synced = 0;
        $created = 0;

        // Get the canonical list of expected names (from seeder)
        $expectedNames = AgentProfile::pluck('name')->toArray();

        foreach ($agents as $agent) {
            $name = $agent['name'] ?? $agent['full_name'] ?? null;
            if (!$name) {
                continue;
            }

            $existing = AgentProfile::where('name', $name)->first();

            if ($existing) {
                $existing->update([
                    'ctm_agent_id' => $agent['id'] ?? $agent['agent_id'] ?? null,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['team'] ?? $agent['group'] ?? null,
                ]);
                $synced++;
            } elseif (in_array($name, $expectedNames)) {
                // Only create if name matches the seeder's canonical list
                AgentProfile::create([
                    'ctm_agent_id' => $agent['id'] ?? $agent['agent_id'] ?? null,
                    'name' => $name,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['team'] ?? $agent['group'] ?? null,
                    'status' => 'active',
                ]);
                $created++;
            }
        }

        return ['synced' => $synced, 'created' => $created];
    }

    /**
     * Filter calls to only those assigned to agents in AgentProfile
     * Works with both raw CTM calls (nested agent.name) and transformed calls (flat agent_name)
     */
    public function filterCallsByProfile(array $calls): array
    {
        $allowedNames = AgentProfile::getNames();

        return array_filter($calls, function ($call) use ($allowedNames) {
            // Try multiple field formats
            $assignedName = $call['assignedAgentName']
                ?? $call['agent_name']
                ?? $call['assigned_agent']
                ?? ($call['agent']['name'] ?? null); // raw CTM nested format
            return $assignedName && in_array($assignedName, $allowedNames);
        });
    }
}
