<div>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Agent Profiles</h2>
        <div class="flex gap-2">
            <button wire:click="syncFromCtm" wire:loading.attr="disabled"
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                <span wire:loading.remove>Sync from CTM</span>
                <span wire:loading>Syncing...</span>
            </button>
        </div>
    </div>

    @if (session()->has('message'))
        <div class="mb-4 p-4 bg-green-100 text-green-800 rounded">{{ session('message') }}</div>
    @endif

    @if ($error)
        <div class="mb-4 p-4 bg-red-100 text-red-800 rounded">{{ $error }}</div>
    @endif

    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CTM Agent ID</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-2"></th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            @forelse($profiles as $profile)
                <tr>
                    <td class="px-4 py-2">{{ $profile->name }}</td>
                    <td class="px-4 py-2">{{ $profile->ctm_agent_id ?? '-' }}</td>
                    <td class="px-4 py-2">{{ $profile->email ?? '-' }}</td>
                    <td class="px-4 py-2">{{ $profile->team ?? '-' }}</td>
                    <td class="px-4 py-2">
                        <span class="px-2 py-1 text-xs rounded {{ $profile->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                            {{ $profile->status }}
                        </span>
                    </td>
                    <td class="px-4 py-2">
                        <button wire:click="deleteProfile({{ $profile->id }})"
                            class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="px-4 py-4 text-center text-gray-500">No agent profiles found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
