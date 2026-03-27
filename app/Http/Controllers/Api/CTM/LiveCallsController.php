<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use App\Services\CTM\Transformer;
use App\Services\Database\SupabaseClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LiveCallsController extends Controller
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
     * Get live/in-progress calls with admin filtering
     * GET /api/ctm/live-calls?status=in_progress&hours=1&groupId=xxx&agentId=xxx
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->attributes->get('user');
            $userEmail = $user['email'] ?? '';
            $userRole = $user['role'] ?? $user['user_metadata']['role'] ?? '';

            // Check if user is admin
            $isAdmin = ($userEmail === self::DEV_EMAIL || $userRole === 'admin');

            $status = $request->input('status', 'in_progress');
            $hours = $request->input('hours', 1);

            $params = [
                'status' => $status,
                'hours' => (int)$hours,
            ];

            // Add optional filters
            if ($request->has('groupId')) {
                $params['group_id'] = $request->input('groupId');
            }
            if ($request->has('agentId')) {
                $params['agent_id'] = $request->input('agentId');
            }

            // Get calls from CTM
            $calls = $this->ctm->calls->getCalls($params);
            $transformed = Transformer::transformCalls($calls);

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
                    'status' => $status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
