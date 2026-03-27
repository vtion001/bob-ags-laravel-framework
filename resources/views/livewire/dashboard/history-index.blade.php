<div>
    <!-- Filters -->
    <div class="mb-6 p-4 bg-white border border-navy-200 rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Search</label>
                <input type="text" wire:model.live.debounce.300ms="filters.search" placeholder="Search calls..."
                       class="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Date From</label>
                <input type="date" wire:model.live="filters.date_from"
                       class="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Date To</label>
                <input type="date" wire:model.live="filters.date_to"
                       class="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500">
            </div>
            <div class="flex items-end">
                <button wire:click="loadCalls" class="w-full bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800">
                    Apply Filters
                </button>
            </div>
        </div>
    </div>

    @if ($error)
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p class="font-medium">{{ $error }}</p>
        </div>
    @endif

    <!-- Calls Table -->
    <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-navy-50 border-b border-navy-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Call ID</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Date</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Agent</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Phone</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Duration</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">QA Score</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-navy-100">
                    @forelse($calls as $call)
                        <tr class="hover:bg-navy-50">
                            <td class="px-4 py-3 text-sm font-mono text-navy-900">{{ $call['id'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm text-navy-600">{{ $call['created_at'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm text-navy-900">{{ $call['agent']['name'] ?? 'Unknown' }}</td>
                            <td class="px-4 py-3 text-sm font-mono text-navy-600">{{ $call['phone'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm text-navy-600">{{ $call['duration'] ?? '0:00' }}</td>
                            <td class="px-4 py-3 text-sm">
                                @isset($call['qa_score'])
                                    <span class="px-2 py-1 rounded-full text-xs font-semibold
                                        {{ $call['qa_score'] >= 80 ? 'bg-green-100 text-green-700' :
                                           ($call['qa_score'] >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') }}">
                                        {{ $call['qa_score'] }}
                                    </span>
                                @else
                                    <span class="text-navy-400">N/A</span>
                                @endisset
                            </td>
                            <td class="px-4 py-3">
                                <a href="{{ route('dashboard.calls.show', $call['id'] ?? '') }}"
                                   class="text-navy-600 hover:text-navy-900 text-sm font-medium">
                                    View Details
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-navy-500">
                                No call history found
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
