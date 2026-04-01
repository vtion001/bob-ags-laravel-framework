<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\CallController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// AssemblyAI token endpoint — must be before auth:sanctum so it works without login
Route::post('/assemblyai/token', [App\Http\Controllers\Api\AssemblyAI\TokenController::class, 'store']);

Route::middleware('auth:sanctum')->prefix('ctm')->group(function () {
    Route::get('/agents', [App\Http\Controllers\Api\CTM\AgentsController::class, 'index']);
    Route::get('/agents/all', [App\Http\Controllers\Api\CTM\AgentsController::class, 'all']);
    Route::get('/agents/groups', [App\Http\Controllers\Api\CTM\AgentsController::class, 'groups']);
    Route::get('/calls', [App\Http\Controllers\Api\CTM\CallsController::class, 'index']);
    Route::get('/calls/{id}', [App\Http\Controllers\Api\CTM\CallsController::class, 'show']);
    Route::get('/calls/{id}/audio', [App\Http\Controllers\Api\CTM\CallsController::class, 'audio']);
    Route::get('/calls/{id}/transcript', [App\Http\Controllers\Api\CTM\CallsController::class, 'transcript']);
    Route::post('/calls/analyze', [App\Http\Controllers\Api\CTM\CallsController::class, 'analyze']);
    Route::get('/calls/history/search', [App\Http\Controllers\Api\CTM\CallsController::class, 'search']);
    Route::get('/active-calls', [App\Http\Controllers\Api\CTM\ActiveCallsController::class, 'index']);
    Route::get('/live-calls', [App\Http\Controllers\Api\CTM\LiveCallsController::class, 'index']);
});

// GodView API routes
Route::middleware('auth:sanctum')->prefix('godview')->group(function () {
    Route::get('/data', [App\Http\Controllers\GodViewController::class, 'data']);
    Route::get('/stats', [App\Http\Controllers\GodViewController::class, 'stats']);
    Route::post('/clear', [App\Http\Controllers\GodViewController::class, 'clear']);
    Route::post('/event', [App\Http\Controllers\GodViewController::class, 'logEvent']);
});

// Agent Profiles API routes
Route::middleware('auth:sanctum')->prefix('agent-profiles')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'store']);
    Route::get('/{id}', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'show']);
    Route::put('/{id}', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'update']);
    Route::delete('/{id}', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'destroy']);
    Route::post('/sync', [App\Http\Controllers\Api\CTM\AgentProfilesController::class, 'sync']);
});
