<div>
    @if ($error)
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p class="font-medium">{{ $error }}</p>
        </div>
    @endif

    @if ($call)
        <!-- Call Details Header -->
        <div class="bg-white border border-navy-200 rounded-xl p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-navy-900">Call Details</h2>
                    <p class="text-navy-500 mt-1">Call ID: {{ $call['id'] ?? '' }}</p>
                </div>
                <a href="{{ route('dashboard.history') }}"
                   class="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 font-medium">
                    Back to History
                </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <dt class="text-sm font-medium text-navy-500">Agent</dt>
                    <dd class="mt-1 text-lg font-semibold text-navy-900">{{ $call['agent']['name'] ?? 'Unknown' }}</dd>
                </div>
                <div>
                    <dt class="text-sm font-medium text-navy-500">Phone</dt>
                    <dd class="mt-1 text-lg font-semibold text-navy-900 font-mono">{{ $call['phone'] ?? '' }}</dd>
                </div>
                <div>
                    <dt class="text-sm font-medium text-navy-500">Duration</dt>
                    <dd class="mt-1 text-lg font-semibold text-navy-900">{{ $call['duration'] ?? '0:00' }}</dd>
                </div>
                <div>
                    <dt class="text-sm font-medium text-navy-500">Date</dt>
                    <dd class="mt-1 text-lg font-semibold text-navy-900">{{ $call['created_at'] ?? '' }}</dd>
                </div>
            </div>
        </div>

        <!-- QA Score -->
        @if(isset($call['qa_score']))
            <div class="bg-white border border-navy-200 rounded-xl p-6 mb-6">
                <h3 class="text-lg font-semibold text-navy-900 mb-4">QA Score</h3>
                <div class="flex items-center gap-6">
                    <div class="text-5xl font-bold text-navy-900">
                        {{ $call['qa_score'] }}
                        <span class="text-xl font-normal text-navy-500">/100</span>
                    </div>
                    <div class="flex-1">
                        <div class="h-4 bg-navy-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full
                                {{ $call['qa_score'] >= 80 ? 'bg-green-500' :
                                   ($call['qa_score'] >= 60 ? 'bg-yellow-500' : 'bg-red-500') }}"
                                 style="width: {{ $call['qa_score'] }}%">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <!-- Transcript -->
        @if(isset($call['transcript']))
            <div class="bg-white border border-navy-200 rounded-xl p-6 mb-6">
                <h3 class="text-lg font-semibold text-navy-900 mb-4">Transcript</h3>
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    @forelse($call['transcript'] as $entry)
                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-24">
                                <span class="px-2 py-1 rounded text-xs font-semibold
                                    {{ ($entry['speaker'] ?? '') === 'Agent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700' }}">
                                    {{ $entry['speaker'] ?? 'Speaker' }}
                                </span>
                            </div>
                            <div class="flex-1 text-navy-700">
                                {{ $entry['text'] ?? '' }}
                            </div>
                        </div>
                    @empty
                        <p class="text-navy-500">No transcript available</p>
                    @endforelse
                </div>
            </div>
        @endif

        <!-- Criteria Breakdown -->
        @if(isset($call['criteria']))
            <div class="bg-white border border-navy-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-navy-900 mb-4">QA Criteria Breakdown</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @forelse($call['criteria'] as $criteria)
                        <div class="p-4 border border-navy-200 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-navy-900">{{ $criteria['name'] ?? 'Criteria' }}</span>
                                <span class="px-2 py-1 rounded text-xs font-semibold
                                    {{ ($criteria['passed'] ?? false) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                    {{ ($criteria['passed'] ?? false) ? 'Passed' : 'Failed' }}
                                </span>
                            </div>
                            <p class="text-sm text-navy-500">{{ $criteria['description'] ?? '' }}</p>
                        </div>
                    @empty
                        <p class="text-navy-500 col-span-full">No criteria data available</p>
                    @endforelse
                </div>
            </div>
        @endif
    @else
        <div class="bg-white border border-navy-200 rounded-xl p-8 text-center">
            <p class="text-navy-500">Call not found</p>
        </div>
    @endif
</div>
