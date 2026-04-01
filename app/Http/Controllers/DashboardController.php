<?php

namespace App\Http\Controllers;

use App\Services\BobApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected BobApiService $bobApi
    ) {}

    public function index()
    {
        return Inertia::render('Dashboard');
    }

    public function history()
    {
        return Inertia::render('History');
    }

    public function monitor()
    {
        return Inertia::render('Monitor');
    }

    public function settings()
    {
        return Inertia::render('Settings');
    }

    public function callDetail()
    {
        return Inertia::render('CallDetail', ['callId' => null]);
    }

    public function showCallDetail($id)
    {
        return Inertia::render('CallDetail', ['callId' => $id]);
    }

    public function agents()
    {
        return Inertia::render('AgentProfiles');
    }

    public function qaLogs()
    {
        return Inertia::render('QALogs');
    }
}
