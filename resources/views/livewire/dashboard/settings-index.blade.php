<div>
    @if ($error)
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p class="font-medium">{{ $error }}</p>
        </div>
    @endif

    <!-- Settings Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @forelse($settings as $setting)
            <div class="bg-white border border-navy-200 rounded-xl p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="font-semibold text-navy-900">{{ $setting['name'] ?? 'Setting' }}</h3>
                        <p class="text-sm text-navy-500 mt-1">{{ $setting['description'] ?? '' }}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold
                        {{ ($setting['is_active'] ?? true) ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-600' }}">
                        {{ ($setting['is_active'] ?? true) ? 'Active' : 'Inactive' }}
                    </span>
                </div>
                <div class="pt-4 border-t border-navy-100">
                    <dl class="space-y-2 text-sm">
                        @foreach($setting['options'] ?? [] as $key => $value)
                            <div class="flex justify-between">
                                <dt class="text-navy-500">{{ ucfirst(str_replace('_', ' ', $key)) }}</dt>
                                <dd class="text-navy-900 font-medium">{{ is_bool($value) ? ($value ? 'Yes' : 'No') : $value }}</dd>
                            </div>
                        @endforeach
                    </dl>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-12 text-navy-500">
                No settings found
            </div>
        @endforelse
    </div>
</div>
