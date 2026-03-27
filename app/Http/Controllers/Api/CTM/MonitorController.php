<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use App\Services\CTM\Transformer;
use App\Services\Database\SupabaseClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MonitorController extends Controller
{
    protected CTMFacade $ctm;
    protected SupabaseClient $supabase;

    // Admin detection
    private const DEV_EMAIL = 'agsdev@allianceglobalsolutions.com';

    public function __construct()
    {
        $this->ctm = new CTMFacade();
        $this->supabase = new SupabaseClient();
    }

    /**
     * Get active calls for monitoring with admin filtering
     * GET /api/ctm/monitor/active-calls?agentId=xxx&groupId=xxx
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->attributes->get('user');
            $userEmail = $user['email'] ?? '';
            $userRole = $user['role'] ?? $user['user_metadata']['role'] ?? '';

            // Check if user is admin
            $isAdmin = ($userEmail === self::DEV_EMAIL || $userRole === 'admin');

            // Get recent calls (5 most recent)
            $calls = $this->ctm->calls->getRecentCalls(5);
            $transformed = Transformer::transformCalls($calls);

            // Apply optional filters from request
            if ($request->has('agentId')) {
                $agentId = $request->input('agentId');
                $transformed = array_filter($transformed, function ($call) use ($agentId) {
                    return ($call['assignedAgentId'] ?? null) == $agentId;
                });
            }

            if ($request->has('groupId')) {
                $groupId = $request->input('groupId');
                $groups = $this->ctm->agents->getUserGroups();
                $groupAgents = array_filter($groups, function ($group) use ($groupId) {
                    return ($group['id'] ?? null) == $groupId;
                });
                $agentIds = array_column($groupAgents, 'agent_id');

                $transformed = array_filter($transformed, function ($call) use ($agentIds) {
                    return in_array($call['assignedAgentId'] ?? null, $agentIds);
                });
            }

            // If not admin, filter by assignedAgentId or assignedGroupId from user_settings
            $assignedGroupId = null;
            $assignedAgentId = null;

            if (!$isAdmin) {
                $userId = $user['id'] ?? null;

                if ($userId) {
                    // Get user settings
                    $settings = $this->supabase->table('user_settings')
                        ->where('user_id', 'eq', $userId)
                        ->get();

                    foreach ($settings as $setting) {
                        if ($setting['key'] === 'assignedAgentId') {
                            $assignedAgentId = $setting['value'];
                        }
                        if ($setting['key'] === 'assignedGroupId') {
                            $assignedGroupId = $setting['value'];
                        }
                    }

                    // If user has assignedAgentId, filter calls by that
                    if ($assignedAgentId) {
                        $transformed = array_filter($transformed, function ($call) use ($assignedAgentId) {
                            return ($call['assignedAgentId'] ?? null) == $assignedAgentId;
                        });
                    }

                    // If user has assignedGroupId, get groups and filter
                    if ($assignedGroupId) {
                        $groups = $this->ctm->agents->getUserGroups();
                        $groupAgents = array_filter($groups, function ($group) use ($assignedGroupId) {
                            return ($group['id'] ?? null) == $assignedGroupId;
                        });

                        $agentIds = array_column($groupAgents, 'agent_id');

                        $transformed = array_filter($transformed, function ($call) use ($agentIds) {
                            return in_array($call['assignedAgentId'] ?? null, $agentIds);
                        });
                    }
                }

                $transformed = array_values($transformed);
            }

            return response()->json([
                'calls' => $transformed,
                'meta' => [
                    'total' => count($transformed),
                    'isAdmin' => $isAdmin,
                    'assignedGroupId' => $assignedGroupId,
                    'assignedAgentId' => $assignedAgentId,
                    'userEmail' => $userEmail,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
