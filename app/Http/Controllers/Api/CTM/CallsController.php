<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use App\Services\CTM\Transformer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CallsController extends Controller
{
    protected CTMFacade $ctm;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = $request->only(['per_page', 'page', 'status', 'direction', 'from_date', 'to_date']);
            $calls = $this->ctm->calls->getCalls($params);
            $transformed = Transformer::transformCalls($calls);
            return response()->json(['data' => $transformed]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $call = $this->ctm->calls->getCall($id);
            if (!$call) {
                return response()->json(['error' => 'Call not found'], 404);
            }
            return response()->json(['data' => Transformer::transformCall($call)]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function audio(Request $request, string $id): JsonResponse
    {
        try {
            $call = $this->ctm->calls->getCall($id);
            if (!$call) {
                return response()->json(['error' => 'Call not found'], 404);
            }
            $recordingUrl = $call['recording_url'] ?? $call['recording'] ?? null;
            if (!$recordingUrl) {
                return response()->json(['error' => 'No recording available'], 404);
            }
            return response()->json(['data' => ['recording_url' => $recordingUrl]]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function transcript(Request $request, string $id): JsonResponse
    {
        try {
            $transcript = $this->ctm->calls->getCallTranscript($id);
            return response()->json(['data' => ['transcript' => $transcript]]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function analyze(Request $request): JsonResponse
    {
        try {
            $callIds = $request->input('call_ids', []);
            $analyzedCalls = [];

            foreach ($callIds as $callId) {
                $call = $this->ctm->calls->getCall($callId);
                if ($call) {
                    $transcript = $this->ctm->calls->getCallTranscript($callId);
                    $call['transcript'] = $transcript;
                    $analyzedCalls[] = Transformer::transformCall($call);
                }
            }

            return response()->json(['data' => $analyzedCalls]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function history(Request $request): JsonResponse
    {
        try {
            $params = $request->only(['per_page', 'from_date', 'to_date']);
            $calls = $this->ctm->calls->getAllCalls($params);
            $transformed = Transformer::transformCalls($calls);
            return response()->json(['data' => $transformed]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $phone = $request->input('phone');
            $hours = $request->input('hours', 8760);

            if (!$phone) {
                return response()->json(['error' => 'Phone parameter is required'], 400);
            }

            $calls = $this->ctm->calls->searchCallsByPhone($phone, (int)$hours);
            $transformed = Transformer::transformCalls($calls);
            return response()->json(['data' => $transformed]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function bulkSync(Request $request): JsonResponse
    {
        try {
            $params = $request->only(['per_page', 'from_date', 'to_date']);
            $calls = $this->ctm->calls->getAllCalls($params);
            $transformed = Transformer::transformCalls($calls);
            return response()->json(['data' => $transformed, 'count' => count($transformed)]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
