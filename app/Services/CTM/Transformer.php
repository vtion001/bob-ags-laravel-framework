<?php

namespace App\Services\CTM;

class Transformer
{
    /**
     * Transform a CTM call record to a standardized format
     */
    public static function transformCall(array $call): array
    {
        $agentId = $call['agent_id'] ?? ($call['agent']['id'] ?? null);
        $agentName = $call['agent']['name'] ?? ($call['agent_name'] ?? null);
        $agentEmail = $call['agent']['email'] ?? ($call['agent_email'] ?? null);

        return [
            'id' => $call['id'] ?? null,
            'call_id' => $call['call_id'] ?? $call['id'] ?? null,

            // Phone fields matching frontend Call interface
            'phone' => $call['from_number'] ?? $call['phone_number'] ?? null,
            'callerNumber' => $call['from_number'] ?? $call['phone_number'] ?? null,
            'trackingNumber' => $call['to_number'] ?? $call['tracking_number'] ?? null,
            'destinationNumber' => $call['to_number'] ?? $call['tracking_number'] ?? null,
            'poolNumber' => $call['pool_number'] ?? null,
            'didNumber' => $call['did_number'] ?? null,

            // Person info
            'name' => $call['caller_name'] ?? null,
            'city' => $call['caller_city'] ?? null,
            'state' => $call['caller_state'] ?? null,
            'postalCode' => $call['caller_zip'] ?? $call['postal_code'] ?? null,

            // Call details matching frontend Call interface
            'direction' => $call['direction'] ?? 'inbound',
            'duration' => (int) ($call['duration'] ?? 0),
            'status' => self::normalizeStatus($call['status'] ?? $call['call_status'] ?? 'completed'),
            'timestamp' => $call['start_time'] ?? $call['created_at'] ?? now()->toIso8601String(),

            // Agent - nested object matching frontend Agent interface
            'agent' => ($agentId || $agentName) ? [
                'id' => (string) $agentId,
                'name' => $agentName,
                'email' => $agentEmail,
            ] : null,

            // Other fields
            'source' => $call['source'] ?? null,
            'sourceId' => $call['source_id'] ?? null,
            'accountId' => $call['account_id'] ?? null,
            'recordingUrl' => $call['recording_url'] ?? $call['recording'] ?? null,
            'transcript' => $call['transcript'] ?? null,
            'talkTime' => (int) ($call['talk_time'] ?? 0),
            'waitTime' => (int) ($call['wait_time'] ?? 0),
            'ringTime' => (int) ($call['ring_time'] ?? 0),
            'score' => isset($call['score']) ? (int) $call['score'] : null,
            'starRating' => isset($call['star_rating']) ? (int) $call['star_rating'] : null,
            'notes' => $call['notes'] ?? null,
            'tags' => $call['tags'] ?? [],
            'disposition' => $call['disposition'] ?? null,
            'disposition_name' => $call['disposition_name'] ?? null,

            // Legacy/additional fields
            'user_group_id' => $call['user_group_id'] ?? null,
            'user_group_name' => $call['user_group_name'] ?? null,
            'campaign' => $call['campaign'] ?? null,
            'keyword' => $call['keyword'] ?? null,
            'first_call' => $call['first_call'] ?? false,
            'ivr_path' => $call['ivr_path'] ?? null,
            'queue_time' => $call['queue_time'] ?? null,
            'created_at' => $call['created_at'] ?? null,
            'updated_at' => $call['updated_at'] ?? null,
        ];
    }

    /**
     * Normalize CTM status to frontend expected values
     */
    private static function normalizeStatus(string $status): string
    {
        $status = strtolower($status);
        if (in_array($status, ['completed', 'done', 'finished', 'ended'])) {
            return 'completed';
        }
        if (in_array($status, ['missed', 'failed', 'noanswer', 'no-answer'])) {
            return 'missed';
        }
        if (in_array($status, ['active', 'in-progress', 'in_progress', 'ringing', 'incoming'])) {
            return 'active';
        }
        return 'completed';
    }

    /**
     * Transform multiple calls
     */
    public static function transformCalls(array $calls): array
    {
        return array_map([self::class, 'transformCall'], $calls);
    }
}
