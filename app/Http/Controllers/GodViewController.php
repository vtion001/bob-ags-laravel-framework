<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\GodView\GodViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GodViewController extends Controller
{
    protected GodViewService $godView;

    public function __construct(GodViewService $godView)
    {
        $this->godView = $godView;
    }

    public function index(Request $request)
    {
        $logs = ActivityLog::orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $stats = [
            'total_logs' => ActivityLog::count(),
            'requests' => ActivityLog::requests()->count(),
            'queries' => ActivityLog::queries()->count(),
            'errors' => ActivityLog::errors()->count(),
            'events' => ActivityLog::events()->count(),
        ];

        return inertia('GodView', [
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $hours = (int) $request->get('hours', 24);
        $type = $request->get('type');
        $limit = (int) $request->get('limit', 100);

        $query = ActivityLog::orderBy('created_at', 'desc');

        if ($type && in_array($type, ['request', 'query', 'error', 'event'])) {
            $query->where('type', $type);
        }

        $query->where('created_at', '>=', now()->subHours($hours));

        $logs = $query->limit($limit)->get();

        return response()->json([
            'logs' => $logs,
            'stats' => [
                'total' => $logs->count(),
                'requests' => $logs->where('type', 'request')->count(),
                'queries' => $logs->where('type', 'query')->count(),
                'errors' => $logs->where('type', 'error')->count(),
                'events' => $logs->where('type', 'event')->count(),
            ],
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $hours = (int) $request->get('hours', 24);

        $stats = [
            'requests' => ActivityLog::requests()->recent($hours)->count(),
            'queries' => ActivityLog::queries()->recent($hours)->count(),
            'errors' => ActivityLog::errors()->recent($hours)->count(),
            'events' => ActivityLog::events()->recent($hours)->count(),
            'avg_response_time' => ActivityLog::requests()->recent($hours)->avg('duration_ms'),
            'slow_queries' => ActivityLog::queries()->recent($hours)->where('duration_ms', '>', 100)->count(),
        ];

        return response()->json($stats);
    }

    public function clear(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 7);
        $deleted = GodViewService::clearOldLogs($days);

        return response()->json([
            'message' => "Cleared {$deleted} old log entries",
            'deleted' => $deleted,
        ]);
    }

    public function logEvent(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'required|string|max:255',
            'context' => 'nullable|array',
        ]);

        $this->godView->logEvent(
            $request->get('action'),
            $request->get('context', [])
        );

        return response()->json(['message' => 'Event logged']);
    }
}
