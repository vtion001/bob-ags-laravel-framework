<?php

namespace App\Services\CTM;

class Transformer
{
    /**
     * Transform a CTM call record to a standardized format
     */
    public static function transformCall(array $call): array
    {
        return [
            'id' => $call['id'] ?? null,
            'call_id' => $call['call_id'] ?? $call['id'] ?? null,
            'from_number' => $call['from_number'] ?? $call['phone_number'] ?? null,
            'to_number' => $call['to_number'] ?? $call['tracking_number'] ?? null,
            'caller_name' => $call['caller_name'] ?? null,
            'caller_city' => $call['caller_city'] ?? null,
            'caller_state' => $call['caller_state'] ?? null,
            'caller_country' => $call['caller_country'] ?? null,
            'transcript' => $call['transcript'] ?? null,
            'recording_url' => $call['recording_url'] ?? $call['recording'] ?? null,
            'recording_duration' => $call['recording_duration'] ?? null,
            'status' => $call['status'] ?? $call['call_status'] ?? null,
            'direction' => $call['direction'] ?? null,
            'start_time' => $call['start_time'] ?? $call['created_at'] ?? null,
            'end_time' => $call['end_time'] ?? $call['ended_at'] ?? null,
            'duration' => $call['duration'] ?? null,
            'wait_time' => $call['wait_time'] ?? null,
            'talk_time' => $call['talk_time'] ?? null,
            'agent_id' => $call['agent_id'] ?? ($call['agent']['id'] ?? null),
            'agent_name' => $call['agent']['name'] ?? ($call['agent_name'] ?? null),
            'agent_email' => $call['agent']['email'] ?? ($call['agent_email'] ?? null),
            'user_group_id' => $call['user_group_id'] ?? null,
            'user_group_name' => $call['user_group_name'] ?? null,
            'source' => $call['source'] ?? null,
            'medium' => $call['medium'] ?? null,
            'campaign' => $call['campaign'] ?? null,
            'referrer' => $call['referrer'] ?? null,
            'keyword' => $call['keyword'] ?? null,
            'first_call' => $call['first_call'] ?? false,
            'ivr_path' => $call['ivr_path'] ?? null,
            'queue_time' => $call['queue_time'] ?? null,
            'disposition' => $call['disposition'] ?? null,
            'disposition_name' => $call['disposition_name'] ?? null,
            'annotations' => $call['annotations'] ?? [],
            'tags' => $call['tags'] ?? [],
            'created_at' => $call['created_at'] ?? null,
            'updated_at' => $call['updated_at'] ?? null,
        ];
    }

    /**
     * Transform multiple calls
     */
    public static function transformCalls(array $calls): array
    {
        return array_map([self::class, 'transformCall'], $calls);
    }
}
