<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Services\CTM\AgentProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AgentProfilesController extends Controller
{
    protected AgentProfileService $agentProfileService;

    public function __construct()
    {
        $this->agentProfileService = new AgentProfileService();
    }

    public function index(Request $request): JsonResponse
    {
        $profiles = AgentProfile::orderBy('name')->get();
        return response()->json(['data' => $profiles]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'agent_id' => 'nullable|string|max:255',
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        // Map agent_id to ctm_agent_id if provided
        if (isset($validated['agent_id']) && !isset($validated['ctm_agent_id'])) {
            $validated['ctm_agent_id'] = $validated['agent_id'];
        }
        unset($validated['agent_id']);

        $profile = AgentProfile::create($validated);
        return response()->json(['data' => $profile], 201);
    }

    public function show(string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);
        return response()->json(['data' => $profile]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'agent_id' => 'nullable|string|max:255',
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        // Map agent_id to ctm_agent_id if provided
        if (isset($validated['agent_id']) && !isset($validated['ctm_agent_id'])) {
            $validated['ctm_agent_id'] = $validated['agent_id'];
        }
        unset($validated['agent_id']);

        $profile->update($validated);
        return response()->json(['data' => $profile]);
    }

    public function destroy(string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['success' => true]);
    }

    public function sync(Request $request): JsonResponse
    {
        try {
            $agents = $request->input('agents', []);

            if (!empty($agents)) {
                // Bulk import from CTM agents list
                $created = 0;
                $skipped = 0;

                foreach ($agents as $agent) {
                    $existing = AgentProfile::where('ctm_agent_id', $agent['id'])->first();
                    if ($existing) {
                        $skipped++;
                        continue;
                    }

                    AgentProfile::create([
                        'ctm_agent_id' => $agent['id'],
                        'name' => $agent['name'],
                        'email' => $agent['email'] ?? null,
                        'status' => 'active',
                    ]);
                    $created++;
                }

                return response()->json(['data' => ['created' => $created, 'skipped' => $skipped]]);
            }

            // Fallback: sync from CTM directly
            $result = $this->agentProfileService->syncFromCtm();
            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
