<div>
    <!-- Filters -->
    <div class="mb-6 p-4 bg-white border border-navy-200 rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Search</label>
                <input type="text" wire:model.live.debounce.300ms="filters.search" placeholder="Search QA logs..."
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
                <button wire:click="loadQaLogs" class="w-full bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800">
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

    <!-- QA Logs Table -->
    <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-navy-50 border-b border-navy-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">ID</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Date</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Agent</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Call ID</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Override Type</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Original Score</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">New Score</th>
                        <th class="px-4 py-3 text-left text-sm font-semibold text-navy-900">Reason</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-navy-100">
                    @forelse($qaLogs as $log)
                        <tr class="hover:bg-navy-50">
                            <td class="px-4 py-3 text-sm font-mono text-navy-900">{{ $log['id'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm text-navy-600">{{ $log['created_at'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm text-navy-900">{{ $log['agent']['name'] ?? 'Unknown' }}</td>
                            <td class="px-4 py-3 text-sm font-mono text-navy-600">{{ $log['call_id'] ?? '' }}</td>
                            <td class="px-4 py-3 text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    {{ $log['override_type'] ?? 'N/A' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-navy-600">
                                <span class="line-through">{{ $log['original_score'] ?? 'N/A' }}</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-green-600 font-semibold">
                                {{ $log['new_score'] ?? 'N/A' }}
                            </td>
                            <td class="px-4 py-3 text-sm text-navy-600">
                                {{ $log['reason'] ?? '' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="px-4 py-8 text-center text-navy-500">
                                No QA logs found
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
