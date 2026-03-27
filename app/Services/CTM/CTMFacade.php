<?php

namespace App\Services\CTM;

class CTMFacade
{
    public CallsService $calls;
    public AgentsService $agents;
    public NumbersService $numbers;
    protected Client $client;

    public function __construct(?Client $client = null)
    {
        $this->client = $client ?? new Client();
        $this->calls = new CallsService($this->client);
        $this->agents = new AgentsService($this->client);
        $this->numbers = new NumbersService($this->client);
    }

    /**
     * Calculate stats from calls array
     */
    public function getStats(array $calls): array
    {
        if (empty($calls)) {
            return [
                'total_calls' => 0,
                'total_duration' => 0,
                'avg_duration' => 0,
                'total_talk_time' => 0,
                'avg_talk_time' => 0,
                'total_wait_time' => 0,
                'avg_wait_time' => 0,
                'answered_calls' => 0,
                'missed_calls' => 0,
                'voicemail_calls' => 0,
            ];
        }

        $totalCalls = count($calls);
        $totalDuration = 0;
        $totalTalkTime = 0;
        $totalWaitTime = 0;
        $answeredCalls = 0;
        $missedCalls = 0;
        $voicemailCalls = 0;

        foreach ($calls as $call) {
            $totalDuration += intval($call['duration'] ?? 0);
            $totalTalkTime += intval($call['talk_time'] ?? 0);
            $totalWaitTime += intval($call['wait_time'] ?? 0);

            $status = strtolower($call['status'] ?? $call['call_status'] ?? '');
            $disposition = strtolower($call['disposition'] ?? '');

            if (in_array($status, ['answered', 'completed']) || $disposition === 'answered') {
                $answeredCalls++;
            } elseif ($status === 'missed' || $disposition === 'missed') {
                $missedCalls++;
            } elseif ($status === 'voicemail' || $disposition === 'voicemail') {
                $voicemailCalls++;
            }
        }

        return [
            'total_calls' => $totalCalls,
            'total_duration' => $totalDuration,
            'avg_duration' => $totalCalls > 0 ? round($totalDuration / $totalCalls, 2) : 0,
            'total_talk_time' => $totalTalkTime,
            'avg_talk_time' => $totalCalls > 0 ? round($totalTalkTime / $totalCalls, 2) : 0,
            'total_wait_time' => $totalWaitTime,
            'avg_wait_time' => $totalCalls > 0 ? round($totalWaitTime / $totalCalls, 2) : 0,
            'answered_calls' => $answeredCalls,
            'missed_calls' => $missedCalls,
            'voicemail_calls' => $voicemailCalls,
        ];
    }
}
