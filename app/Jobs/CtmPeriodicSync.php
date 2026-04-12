<?php

namespace App\Jobs;

use App\Services\FastApiService;
use App\Models\AgentProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CtmPeriodicSync implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function handle(FastApiService $fastApi): void
    {
        Log::info('[CtmPeriodicSync] Starting periodic sync...');

        // 1. Trigger FastAPI to refresh CTM cache
        $triggerResult = $fastApi->triggerSync();
        Log::info('[CtmPeriodicSync] Trigger result: ' . json_encode($triggerResult));

        // FastAPI sync runs in the background — do not block the queue worker
        if (isset($triggerResult['job_id'])) {
            Log::info('[CtmPeriodicSync] FastAPI sync job_id: ' . $triggerResult['job_id']);
        }

        // 2. Invalidate agents cache so next request fetches fresh
        $fastApi->invalidateCache('agents');

        // 3. Sync agent profiles from CTM (update existing, don't create new)
        $this->syncAgentProfiles();

        Log::info('[CtmPeriodicSync] Periodic sync complete.');
    }

    protected function syncAgentProfiles(): void
    {
        $fastApi = app(FastApiService::class);
        $response = $fastApi->get('ctm/agents');

        $agents = $response['data']['agents'] ?? $response['agents'] ?? [];
        $expectedNames = AgentProfile::pluck('name')->toArray();
        $synced = 0;

        foreach ($agents as $agent) {
            $name = $agent['name'] ?? null;
            if (!$name) continue;

            $existing = AgentProfile::where('name', $name)->first();
            if ($existing) {
                $existing->update([
                    'ctm_agent_id' => $agent['id'] ?? null,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['group'] ?? null,
                ]);
                $synced++;
            }
        }

        Log::info("[CtmPeriodicSync] Synced {$synced} agent profiles.");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[CtmPeriodicSync] Failed: ' . $exception->getMessage());
    }
}