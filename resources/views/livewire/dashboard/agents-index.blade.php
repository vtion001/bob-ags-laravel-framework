<div>
    <!-- Filters -->
    <div class="mb-6 p-4 bg-white border border-navy-200 rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Search</label>
                <input type="text" wire:model.live.debounce.300ms="filters.search" placeholder="Search agents..."
                       class="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-navy-700 mb-1">Status</label>
                <select wire:model.live="filters.status"
                        class="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500">
                    <option value="">All Statuses</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="busy">Busy</option>
                </select>
            </div>
        </div>
        <div class="mt-4 flex justify-end">
            <button wire:click="loadAgents" class="bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800">
                Apply Filters
            </button>
        </div>
    </div>

    @if ($error)
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p class="font-medium">{{ $error }}</p>
        </div>
    @endif

    <!-- Agents Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @forelse($agents as $agent)
            <div class="bg-white border border-navy-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center">
                        <span class="text-lg font-semibold text-navy-700">
                            {{ strtoupper(substr($agent['name'] ?? 'U', 0, 1)) }}
                        </span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-navy-900">{{ $agent['name'] ?? 'Unknown' }}</h3>
                        <p class="text-sm text-navy-500">{{ $agent['email'] ?? '' }}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold
                        {{ ($agent['status'] ?? '') === 'online' ? 'bg-green-100 text-green-700' :
                           (($agent['status'] ?? '') === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-navy-100 text-navy-600') }}">
                        {{ ucfirst($agent['status'] ?? 'offline') }}
                    </span>
                    <span class="text-sm text-navy-500">
                        {{ $agent['calls_today'] ?? 0 }} calls today
                    </span>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-12 text-navy-500">
                No agents found
            </div>
        @endforelse
    </div>
</div>
