<?php

namespace App\Http\Controllers;

use App\Services\BobApiService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected BobApiService $bobApi
    ) {}

    public function index()
    {
        return view('dashboard.dashboard');
    }

    public function monitor()
    {
        return view('dashboard.monitor.index');
    }

    public function history()
    {
        return view('dashboard.history.index');
    }

    public function agents()
    {
        return view('dashboard.agents.index');
    }

    public function settings()
    {
        return view('dashboard.settings.index');
    }

    public function qaLogs()
    {
        return view('dashboard.qa-logs.index');
    }

    public function callDetail($id)
    {
        return view('dashboard.calls.show', ['callId' => $id]);
    }
}
