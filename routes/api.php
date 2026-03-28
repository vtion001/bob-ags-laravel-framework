<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\CallController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->prefix('ctm')->group(function () {
    Route::get('/agents', [AgentController::class, 'index']);
    Route::get('/calls', [CallController::class, 'index']);
    Route::get('/calls/{id}', [CallController::class, 'show']);
    Route::get('/active-calls', [CallController::class, 'active']);
    Route::get('/live-calls', [CallController::class, 'live']);
});
