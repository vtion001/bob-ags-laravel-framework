<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    protected $fillable = [
        'ctm_agent_id',
        'name',
        'email',
        'team',
        'status',
    ];

    /**
     * Get agent names as an array (for filtering)
     */
    public static function getNames(): array
    {
        return static::where('status', 'active')->pluck('name')->toArray();
    }

    /**
     * Check if a given name matches any active agent profile
     */
    public static function matchesName(string $name): bool
    {
        return in_array($name, static::getNames());
    }
}
