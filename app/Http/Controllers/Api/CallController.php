<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CallController extends Controller
{
    public function index(): JsonResponse
    {
        // TODO: Implement calls listing using FastApiService or BobApiService
        return response()->json(['calls' => []]);
    }

    public function show(string $id): JsonResponse
    {
        // TODO: Implement single call retrieval
        return response()->json(['call' => ['id' => $id]]);
    }

    public function active(): JsonResponse
    {
        // TODO: Implement active calls
        return response()->json(['calls' => []]);
    }

    public function live(): JsonResponse
    {
        // TODO: Implement live calls
        return response()->json(['calls' => []]);
    }
}