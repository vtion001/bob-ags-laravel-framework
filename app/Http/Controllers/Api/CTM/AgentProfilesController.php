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
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

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
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

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
            $result = $this->agentProfileService->syncFromCtm();
            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
