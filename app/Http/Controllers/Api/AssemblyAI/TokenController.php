<?php

namespace App\Http\Controllers\Api\AssemblyAI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class TokenController extends Controller
{
    /**
     * Get a temporary AssemblyAI token for frontend realtime SDK
     * The frontend AssemblyAI SDK requires a signed token to connect
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $apiKey = config('services.assemblyai.api_key');

            if (empty($apiKey)) {
                return response()->json([
                    'error' => 'AssemblyAI API key not configured'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // AssemblyAI uses Bearer token auth
            $ch = curl_init('https://api.assemblyai.com/v2/realtime/token');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: ' . $apiKey,
                    'Content-Type: application/json',
                ],
                CURLOPT_POSTFIELDS => json_encode([
                    'expires_in' => 3600, // 1 hour
                ]),
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                return response()->json([
                    'error' => 'Failed to connect to AssemblyAI: ' . $error
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            if ($httpCode !== 200) {
                return response()->json([
                    'error' => 'AssemblyAI token error',
                    'response' => json_decode($response, true)
                ], $httpCode);
            }

            $data = json_decode($response, true);
            return response()->json([
                'data' => [
                    'token' => $data['token'],
                    'expires_at' => $data['expires_at'] ?? null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
