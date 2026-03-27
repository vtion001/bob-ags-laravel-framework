<div>
    <!-- Header -->
    <div class="p-6 lg:p-8 border-b border-navy-100">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-navy-900 mb-1">Live Monitor</h1>
                <p class="text-navy-500">Real-time call analysis powered by AssemblyAI</p>
            </div>

            <div class="flex items-center gap-3">
                @if (!$isMonitoring)
                    <button wire:click="startMonitoring"
                            class="bg-navy-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-navy-800 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Start Live Analysis
                    </button>
                @else
                    <div class="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-sm font-semibold text-green-700">Monitoring Active</span>
                    </div>
                    <button wire:click="stopMonitoring"
                            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
                        Stop Monitoring
                    </button>
                @endif
            </div>
        </div>

        @if ($error)
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <p class="font-medium">{{ $error }}</p>
            </div>
        @endif
    </div>

    <!-- Content -->
    <div class="p-6 lg:p-8">
        @if (!$isMonitoring)
            <!-- Idle State -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white border border-navy-200 rounded-xl p-8 text-center">
                        <div class="w-20 h-20 rounded-2xl bg-navy-100 flex items-center justify-center mx-auto mb-6">
                            <svg class="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-navy-900 mb-3">Real-Time Call Analysis</h2>
                        <p class="text-navy-500 mb-8">
                            Click "Start Live Analysis" to begin real-time transcription and QA scoring.
                        </p>
                    </div>
                </div>
                <div>
                    <!-- Active Calls List -->
                    <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
                        <div class="px-4 py-3 border-b border-navy-200 bg-navy-50">
                            <h3 class="font-semibold text-navy-900">Active Calls</h3>
                        </div>
                        <div class="divide-y divide-navy-100 max-h-96 overflow-y-auto">
                            @forelse($activeCalls as $call)
                                <div wire:click="selectCall('{{ $call['id'] }}')"
                                     class="px-4 py-3 hover:bg-navy-50 cursor-pointer {{ $selectedCallId === $call['id'] ? 'bg-navy-50' : '' }}">
                                    <div class="flex items-center justify-between">
                                        <span class="font-medium text-navy-900">{{ $call['agent']['name'] ?? 'Unknown' }}</span>
                                        <span class="text-xs text-navy-500">{{ $call['duration'] ?? '0:00' }}</span>
                                    </div>
                                    <div class="text-sm text-navy-600">{{ $call['phone'] ?? '' }}</div>
                                </div>
                            @empty
                                <div class="px-4 py-8 text-center text-navy-500">
                                    No active calls
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>
            </div>
        @else
            <!-- Monitoring State -->
            <div class="space-y-4">
                <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div class="xl:col-span-7 space-y-4">
                        <!-- Transcript Panel -->
                        <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
                            <div class="px-4 py-3 border-b border-navy-200 bg-navy-50">
                                <h3 class="font-semibold text-navy-900">Live Transcript</h3>
                            </div>
                            <div class="p-4 max-h-96 overflow-y-auto">
                                @forelse($liveState['transcript'] ?? [] as $entry)
                                    <div class="mb-3">
                                        <span class="font-semibold text-navy-700">{{ $entry['speaker'] ?? 'Speaker' }}:</span>
                                        <span class="text-navy-600">{{ $entry['text'] ?? '' }}</span>
                                    </div>
                                @empty
                                    <p class="text-navy-500 text-center py-4">Waiting for transcript data...</p>
                                @endforelse
                            </div>
                        </div>
                    </div>

                    <div class="xl:col-span-5 space-y-4">
                        <!-- Score Card -->
                        <div class="bg-white border border-navy-200 rounded-xl p-4">
                            <h3 class="font-semibold text-navy-900 mb-2">QA Score</h3>
                            <div class="text-4xl font-bold text-navy-900">
                                {{ $liveState['score'] ?? 100 }}
                                <span class="text-lg font-normal text-navy-500">/100</span>
                            </div>
                        </div>

                        <!-- Call Details -->
                        @if($selectedCallData)
                            <div class="bg-white border border-navy-200 rounded-xl p-4">
                                <h3 class="font-semibold text-navy-900 mb-2">Call Details</h3>
                                <dl class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <dt class="text-navy-500">Agent</dt>
                                        <dd class="text-navy-900">{{ $selectedCallData['agent']['name'] ?? 'Unknown' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-navy-500">Phone</dt>
                                        <dd class="text-navy-900 font-mono">{{ $selectedCallData['phone'] ?? '' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-navy-500">Duration</dt>
                                        <dd class="text-navy-900">{{ $selectedCallData['duration'] ?? '0:00' }}</dd>
                                    </div>
                                </dl>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        @endif
    </div>
</div>