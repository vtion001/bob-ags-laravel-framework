<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CTM\AgentProfilesController;
use App\Http\Controllers\Api\AuthController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/session', [AuthController::class, 'session'])->middleware('auth:sanctum');
});

// Agent Profiles CRUD (still handled by Laravel, stored in SQLite)
Route::prefix('agent-profiles')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AgentProfilesController::class, 'index']);
    Route::post('/', [AgentProfilesController::class, 'store']);
    Route::get('/{id}', [AgentProfilesController::class, 'show']);
    Route::put('/{id}', [AgentProfilesController::class, 'update']);
    Route::delete('/{id}', [AgentProfilesController::class, 'destroy']);
    Route::post('/sync', [AgentProfilesController::class, 'sync']);
});

// NOTE: All /ctm/* routes are now handled by FastAPI at http://localhost:8000
// Laravel Livewire components call FastApiService which proxies to FastAPI
