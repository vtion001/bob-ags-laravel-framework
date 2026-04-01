<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Guest route for login page (Inertia)
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
});

// Dashboard route (protected by auth middleware)
Route::middleware('auth')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('history', [DashboardController::class, 'history'])->name('history');
    Route::get('monitor', [DashboardController::class, 'monitor'])->name('monitor');
    Route::get('settings', [DashboardController::class, 'settings'])->name('settings');
    Route::get('call-detail', [DashboardController::class, 'callDetail'])->name('call-detail');
    Route::get('call-detail/{id}', [DashboardController::class, 'showCallDetail'])->name('call-detail.show');
    Route::get('agents', [DashboardController::class, 'agents'])->name('agents');
    Route::get('qa-logs', [DashboardController::class, 'qaLogs'])->name('qa-logs');
});

// GodView routes
Route::middleware('auth')->group(function () {
    Route::get('godview', [App\Http\Controllers\GodViewController::class, 'index'])->name('godview');
});

// Load auth routes
require __DIR__.'/auth.php';
