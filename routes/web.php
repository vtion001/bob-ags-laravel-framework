<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
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
});
