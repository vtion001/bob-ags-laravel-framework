<?php

namespace App\Http\Middleware;

use App\Services\GodView\GodViewService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class GodViewMiddleware
{
    protected GodViewService $godView;

    public function __construct(GodViewService $godView)
    {
        $this->godView = $godView;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $this->godView->startCapturing();

        try {
            $response = $next($request);
        } catch (\Throwable $e) {
            $this->godView->logError($e->getMessage(), $e, [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
            throw $e;
        }

        return $response;
    }

    public function terminate(Request $request, Response $response): void
    {
        if (!config('app.debug')) {
            return;
        }

        // Capture response content size
        $contentSize = strlen($response->getContent());

        // Log the request
        $context = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'content_size' => $contentSize,
        ];

        $this->godView->logRequest(
            $request->method(),
            $request->fullUrl(),
            $response->getStatusCode(),
            $context
        );

        // Log any captured queries
        foreach ($this->godView->getQueryLogs() as $query) {
            try {
                \App\Models\ActivityLog::create([
                    'user_id' => auth()->id(),
                    'type' => 'query',
                    'action' => substr($query['sql'], 0, 255),
                    'duration_ms' => (int) $query['time'],
                    'context' => [
                        'bindings' => $query['bindings'],
                        'full_sql' => $query['sql'],
                    ],
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to log query: ' . $e->getMessage());
            }
        }

        $this->godView->stopCapturing();
    }
}
