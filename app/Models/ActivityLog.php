<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'action',
        'method',
        'url',
        'status_code',
        'duration_ms',
        'memory_mb',
        'context',
        'stack_trace',
    ];

    protected $casts = [
        'context' => 'array',
        'duration_ms' => 'integer',
        'memory_mb' => 'float',
        'status_code' => 'integer',
    ];

    public $timestamps = false;

    protected static function booted(): void
    {
        static::creating(function (ActivityLog $log) {
            $log->created_at = now();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRequests($query)
    {
        return $query->where('type', 'request');
    }

    public function scopeQueries($query)
    {
        return $query->where('type', 'query');
    }

    public function scopeErrors($query)
    {
        return $query->where('type', 'error');
    }

    public function scopeEvents($query)
    {
        return $query->where('type', 'event');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }
}
