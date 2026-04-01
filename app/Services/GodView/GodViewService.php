<?php

namespace App\Services\GodView;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class GodViewService
{
    protected array $queryLogs = [];
    protected array $eventLogs = [];
    protected ?int $startTime = null;
    protected ?int $startMemory = null;
    protected bool $isCapturing = false;

    public function startCapturing(): void
    {
        $this->startTime = microtime(true);
        $this->startMemory = memory_get_usage(true);
        $this->queryLogs = [];
        $this->eventLogs = [];
        $this->isCapturing = true;

        // Listen to database queries
        DB::listen(function ($query) {
            if ($this->isCapturing) {
                $this->logQuery($query);
            }
        });
    }

    public function stopCapturing(): void
    {
        $this->isCapturing = false;
    }

    public function logRequest(
        string $method,
        string $url,
        int $statusCode,
        array $context = []
    ): ?ActivityLog {
        if (!$this->startTime) {
            return null;
        }

        $duration = (microtime(true) - $this->startTime) * 1000;
        $memory = (memory_get_usage(true) - $this->startMemory) / 1024 / 1024;

        return ActivityLog::create([
            'user_id' => auth()->id(),
            'type' => 'request',
            'action' => "{$method} {$url}",
            'method' => $method,
            'url' => $url,
            'status_code' => $statusCode,
            'duration_ms' => (int) $duration,
            'memory_mb' => round($memory, 2),
            'context' => $context,
        ]);
    }

    public function logQuery($query): void
    {
        $this->queryLogs[] = [
            'sql' => $query->sql,
            'bindings' => $query->bindings,
            'time' => $query->time,
        ];
    }

    public function logError(
        string $message,
        ?\Throwable $exception = null,
        array $context = []
    ): ?ActivityLog {
        return ActivityLog::create([
            'user_id' => auth()->id(),
            'type' => 'error',
            'action' => $message,
            'context' => $context,
            'stack_trace' => $exception ? $exception->getTraceAsString() : null,
        ]);
    }

    public function logEvent(
        string $action,
        array $context = []
    ): ?ActivityLog {
        return ActivityLog::create([
            'user_id' => auth()->id(),
            'type' => 'event',
            'action' => $action,
            'context' => $context,
        ]);
    }

    public function getQueryLogs(): array
    {
        return $this->queryLogs;
    }

    public function getEventLogs(): array
    {
        return $this->eventLogs;
    }

    public function getStats(): array
    {
        return [
            'query_count' => count($this->queryLogs),
            'event_count' => count($this->eventLogs),
            'total_query_time' => array_sum(array_column($this->queryLogs, 'time')),
            'duration_ms' => $this->startTime ? (microtime(true) - $this->startTime) * 1000 : 0,
            'memory_mb' => $this->startMemory ? round((memory_get_usage(true) - $this->startMemory) / 1024 / 1024, 2) : 0,
        ];
    }

    public static function getRecentLogs(int $limit = 100, int $hours = 24): array
    {
        return ActivityLog::recent($hours)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public static function getLogsByType(string $type, int $limit = 100): array
    {
        return ActivityLog::ofType($type)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public static function clearOldLogs(int $days = 7): int
    {
        return ActivityLog::where('created_at', '<', now()->subDays($days))->delete();
    }

    public static function isGodUser(?\App\Models\User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $user->is_god === true || $user->role === 'god';
    }
}
