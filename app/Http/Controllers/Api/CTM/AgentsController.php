<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use App\Services\CTM\AgentProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AgentsController extends Controller
{
    protected CTMFacade $ctm;
    protected AgentProfileService $agentProfileService;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
        $this->agentProfileService = new AgentProfileService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $agents = $this->agentProfileService->getFilteredAgents();
            return response()->json(['data' => $agents]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function groups(Request $request): JsonResponse
    {
        try {
            $groups = $this->ctm->agents->getUserGroups();
            return response()->json(['data' => $groups]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
