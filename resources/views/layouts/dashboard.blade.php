@extends('layouts.app')

@section('title', 'Dashboard - BOB')

@section('content')
<div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav class="bg-navy-900 text-white">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <svg class="w-6 h-6 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span class="font-semibold text-lg">BOB Agent</span>
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-sm text-white/70">{{ auth()->user()->email }}</span>
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="text-sm text-white/70 hover:text-white transition-colors">
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="flex">
        <!-- Sidebar -->
        <aside class="hidden md:flex flex-col w-64 bg-navy-900 text-white">
            <nav class="flex-1 px-3 py-6 space-y-1">
                <a href="{{ route('dashboard') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard') && request()->path() == 'dashboard' ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">Calls</span>
                        <span class="text-xs block truncate text-white/50">View all calls</span>
                    </div>
                </a>

                <a href="{{ route('dashboard.monitor') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard.monitor') ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">Monitor</span>
                        <span class="text-xs block truncate text-white/50">Live monitoring</span>
                    </div>
                </a>

                <a href="{{ route('dashboard.history') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard.history') ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">History</span>
                        <span class="text-xs block truncate text-white/50">Search calls</span>
                    </div>
                </a>

                <a href="{{ route('dashboard.qa-logs') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard.qa-logs') ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">QA Logs</span>
                        <span class="text-xs block truncate text-white/50">Override history</span>
                    </div>
                </a>

                <a href="{{ route('dashboard.agents') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard.agents') ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">Agents</span>
                        <span class="text-xs block truncate text-white/50">Manage profiles</span>
                    </div>
                </a>

                <a href="{{ route('dashboard.settings') }}"
                   class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          {{ request()->routeIs('dashboard.settings') ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10 hover:text-white' }}">
                    <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium block truncate">Settings</span>
                        <span class="text-xs block truncate text-white/50">Preferences</span>
                    </div>
                </a>
            </nav>

            <!-- User role badge -->
            <div class="p-4 m-3 rounded-xl bg-white/10 border border-white/20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <svg class="w-5 h-5 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <span class="text-sm font-semibold text-white block">BOB Agent</span>
                        <span class="text-xs text-white/60">
                            {{ ucfirst(auth()->user()->role ?? 'viewer') }}
                        </span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 bg-white min-h-screen">
            @yield('main-content')
        </main>
    </div>
</div>

@livewireScripts
@stack('scripts')
@endsection
