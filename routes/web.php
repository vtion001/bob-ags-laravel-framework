<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Guest routes (not authenticated)
Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/monitor', [DashboardController::class, 'monitor'])->name('dashboard.monitor');
    Route::get('/dashboard/history', [DashboardController::class, 'history'])->name('dashboard.history');
    Route::get('/dashboard/agents', [DashboardController::class, 'agents'])->name('dashboard.agents');
    Route::get('/dashboard/settings', [DashboardController::class, 'settings'])->name('dashboard.settings');
    Route::get('/dashboard/qa-logs', [DashboardController::class, 'qaLogs'])->name('dashboard.qa-logs');
    Route::get('/dashboard/calls/{id}', [DashboardController::class, 'callDetail'])->name('dashboard.calls.show');
});
