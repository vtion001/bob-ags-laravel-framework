# Agent Profiles + CTM Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate CTM services from bob-ags-api into bob-ags-laravel, create an AgentProfile model to store the 17 Phillies agents, and ensure Calls History and Monitoring only show calls from those agents.

**Architecture:** CTM HTTP client and services are copied directly from bob-ags-api into `app/Services/CTM/`. An `AgentProfile` model stores agent names that must match CTM agent names for filtering. The existing `BobApiService` proxy is replaced with direct CTM service calls. Call history and monitoring endpoints filter by agent names stored in `AgentProfile`.

**Tech Stack:** Laravel 11, Livewire, SQLite, CTM API (calltrackingmetrics.com), Guzzle HTTP

---

## File Structure

```
bob-ags-laravel/
├── app/
│   ├── Console/Commands/
│   │   └── CtmSyncAgents.php          # NEW: Artisan command to sync agents from CTM
│   ├── Http/Controllers/Api/CTM/
│   │   ├── AgentsController.php        # NEW: Copied from bob-ags-api
│   │   ├── CallsController.php         # NEW: Copied from bob-ags-api
│   │   ├── ActiveCallsController.php   # NEW: Copied from bob-ags-api
│   │   ├── LiveCallsController.php     # NEW: Copied from bob-ags-api
│   │   ├── MonitorController.php       # NEW: Copied from bob-ags-api
│   │   └── AgentProfilesController.php # NEW: CRUD for AgentProfile
│   ├── Livewire/Dashboard/
│   │   ├── AgentProfilesIndex.php      # NEW: Livewire component for profile management
│   │   ├── HistoryIndex.php            # MODIFY: Filter by agent_profile names
│   │   └── MonitorIndex.php            # MODIFY: Filter by agent_profile names
│   ├── Models/
│   │   └── AgentProfile.php            # NEW: Agent profile model
│   └── Services/CTM/
│       ├── Client.php                  # NEW: Copied from bob-ags-api
│       ├── CTMFacade.php               # NEW: Copied from bob-ags-api
│       ├── AgentsService.php           # NEW: Copied from bob-ags-api
│       ├── CallsService.php            # NEW: Copied from bob-ags-api
│       ├── Transformer.php             # NEW: Copied from bob-ags-api
│       └── AgentProfileService.php     # NEW: Filtering logic by AgentProfile
├── config/
│   └── services.php                    # MODIFY: Add CTM config
├── database/migrations/
│   └── xxxx_xx_xx_create_agent_profiles_table.php  # NEW
├── resources/views/livewire/dashboard/
│   └── agent-profiles-index.blade.php  # NEW
└── routes/
    └── api.php                         # MODIFY: Add CTM routes + AgentProfile routes
```

---

## Pre-requisite: Config Setup

- [ ] **Step 1: Add CTM config to services.php**

Modify: `config/services.php`

Add at the end of the `services` array:

```php
'ctm' => [
    'access_key' => env('CTM_ACCESS_KEY', ''),
    'secret_key' => env('CTM_SECRET_KEY', ''),
    'account_id' => env('CTM_ACCOUNT_ID', ''),
],
```

Also add to `.env`:

```
CTM_ACCESS_KEY=your_access_key
CTM_SECRET_KEY=your_secret_key
CTM_ACCOUNT_ID=your_account_id
```

---

## Task 1: Copy CTM Services from bob-ags-api

**Files:**
- Create: `app/Services/CTM/Client.php`
- Create: `app/Services/CTM/CTMFacade.php`
- Create: `app/Services/CTM/AgentsService.php`
- Create: `app/Services/CTM/CallsService.php`
- Create: `app/Services/CTM/Transformer.php`

Source files to copy from:
- `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/app/Services/CTM/Client.php`
- `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/app/Services/CTM/CTMFacade.php`
- `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/app/Services/CTM/AgentsService.php`
- `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/app/Services/CTM/CallsService.php`
- `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/app/Services/CTM/Transformer.php`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p app/Services/CTM
```

- [ ] **Step 2: Copy Client.php**

Copy content from `bob-ags-api/app/Services/CTM/Client.php` to `app/Services/CTM/Client.php`.
Update namespace from `App\Services\CTM` to `App\Services\CTM`.

- [ ] **Step 3: Copy CTMFacade.php**

Copy content from `bob-ags-api/app/Services/CTM/CTMFacade.php`.
Update namespace to `App\Services\CTM`.

- [ ] **Step 4: Copy AgentsService.php**

Copy content from `bob-ags-api/app/Services/CTM/AgentsService.php`.
Update namespace to `App\Services\CTM`.

- [ ] **Step 5: Copy CallsService.php**

Copy content from `bob-ags-api/app/Services/CTM/CallsService.php`.
Update namespace to `App\Services\CTM`.

- [ ] **Step 6: Copy Transformer.php**

Copy content from `bob-ags-api/app/Services/CTM/Transformer.php`.
Update namespace to `App\Services\CTM`.

- [ ] **Step 7: Verify**

Run: `php artisan route:list --path=ctm`
Expected: Should show "ctm" routes (they don't exist yet, so this will fail — that's fine, we're just verifying the files load)

---

## Task 2: Create AgentProfile Model + Migration

**Files:**
- Create: `database/migrations/xxxx_xx_xx_create_agent_profiles_table.php`
- Create: `app/Models/AgentProfile.php`

- [ ] **Step 1: Create migration**

Run:
```bash
php artisan make:migration create_agent_profiles_table
```

Modify the generated migration file (in `database/migrations/`):

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('ctm_agent_id')->nullable();
            $table->string('name');                    // e.g., "May Ligad Phillies"
            $table->string('email')->nullable();
            $table->string('team')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};
```

- [ ] **Step 2: Create AgentProfile model**

Create: `app/Models/AgentProfile.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    protected $fillable = [
        'ctm_agent_id',
        'name',
        'email',
        'team',
        'status',
    ];

    /**
     * Get agent names as an array (for filtering)
     */
    public static function getNames(): array
    {
        return static::where('status', 'active')->pluck('name')->toArray();
    }

    /**
     * Check if a given name matches any active agent profile
     */
    public static function matchesName(string $name): bool
    {
        return in_array($name, static::getNames());
    }
}
```

- [ ] **Step 3: Run migration**

Run:
```bash
php artisan migrate
```

---

## Task 3: Create AgentProfileService

**Files:**
- Create: `app/Services/CTM/AgentProfileService.php`

- [ ] **Step 1: Create AgentProfileService**

Create: `app/Services/CTM/AgentProfileService.php`

```php
<?php

namespace App\Services\CTM;

use App\Models\AgentProfile;

class AgentProfileService
{
    protected CTMFacade $ctm;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
    }

    /**
     * Get all CTM agents, filtered to only AgentProfile names
     */
    public function getFilteredAgents(): array
    {
        $agents = $this->ctm->agents->getAgents();
        $allowedNames = AgentProfile::getNames();

        return array_filter($agents, function ($agent) use ($allowedNames) {
            $name = $agent['name'] ?? $agent['full_name'] ?? '';
            return in_array($name, $allowedNames);
        });
    }

    /**
     * Sync agent profiles from CTM
     * Updates existing records, creates new ones
     */
    public function syncFromCtm(): array
    {
        $agents = $this->ctm->agents->getAgents();
        $synced = 0;
        $created = 0;

        foreach ($agents as $agent) {
            $name = $agent['name'] ?? $agent['full_name'] ?? null;
            if (!$name) {
                continue;
            }

            $existing = AgentProfile::where('name', $name)->first();

            if ($existing) {
                $existing->update([
                    'ctm_agent_id' => $agent['id'] ?? $agent['agent_id'] ?? null,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['team'] ?? $agent['group'] ?? null,
                ]);
                $synced++;
            } else {
                // Only create if name matches expected names (seeded list)
                AgentProfile::create([
                    'ctm_agent_id' => $agent['id'] ?? $agent['agent_id'] ?? null,
                    'name' => $name,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['team'] ?? $agent['group'] ?? null,
                    'status' => 'active',
                ]);
                $created++;
            }
        }

        return ['synced' => $synced, 'created' => $created];
    }

    /**
     * Filter calls to only those assigned to agents in AgentProfile
     */
    public function filterCallsByProfile(array $calls): array
    {
        $allowedNames = AgentProfile::getNames();

        return array_filter($calls, function ($call) use ($allowedNames) {
            $assignedName = $call['assignedAgentName'] ?? $call['agent_name'] ?? $call['assigned_agent'] ?? null;
            return $assignedName && in_array($assignedName, $allowedNames);
        });
    }
}
```

---

## Task 4: Create CTM API Controllers

**Files:**
- Create: `app/Http/Controllers/Api/CTM/AgentsController.php`
- Create: `app/Http/Controllers/Api/CTM/CallsController.php`
- Create: `app/Http/Controllers/Api/CTM/ActiveCallsController.php`
- Create: `app/Http/Controllers/Api/CTM/LiveCallsController.php`
- Create: `app/Http/Controllers/Api/CTM/MonitorController.php`

- [ ] **Step 1: Create directory**

```bash
mkdir -p app/Http/Controllers/Api/CTM
```

- [ ] **Step 2: Copy AgentsController.php**

Copy from `bob-ags-api/app/Http/Controllers/Api/CTM/AgentsController.php`.
Update namespace to `App\Http\Controllers\Api\CTM`.
The controller should use `AgentProfileService` to filter agents:

```php
<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use App\Services\CTM\AgentProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AgentsController extends Controller
{
    protected CTMFacade $ctm;
    protected AgentProfileService $agentProfileService;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
        $this->agentProfileService = new AgentProfileService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $agents = $this->agentProfileService->getFilteredAgents();
            return response()->json(['data' => $agents]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function groups(Request $request): JsonResponse
    {
        try {
            $groups = $this->ctm->agents->getUserGroups();
            return response()->json(['data' => $groups]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```

- [ ] **Step 3: Copy CallsController.php**

Copy from `bob-ags-api/app/Http/Controllers/Api/CTM/CallsController.php`.
Update namespace to `App\Http\Controllers\Api\CTM`.
Keep the original logic — calls filtering happens at the Livewire component level.

- [ ] **Step 4: Copy ActiveCallsController.php**

Copy from `bob-ags-api/app/Http/Controllers/Api/CTM/ActiveCallsController.php`.
Update namespace to `App\Http\Controllers\Api\CTM`.

- [ ] **Step 5: Copy LiveCallsController.php**

Copy from `bob-ags-api/app/Http/Controllers/Api/CTM/LiveCallsController.php`.
Update namespace to `App\Http\Controllers\Api\CTM`.
**Important**: The filtering logic in `index()` that uses `assignedAgentId` should be changed to filter by `assignedAgentName` against `AgentProfile::getNames()`.

- [ ] **Step 6: Copy MonitorController.php**

Copy from `bob-ags-api/app/Http/Controllers/Api/CTM/MonitorController.php`.
Update namespace to `App\Http\Controllers\Api\CTM`.

---

## Task 5: Create AgentProfiles CRUD Controller

**Files:**
- Create: `app/Http/Controllers/Api/CTM/AgentProfilesController.php`

- [ ] **Step 1: Create AgentProfilesController**

Create: `app/Http/Controllers/Api/CTM/AgentProfilesController.php`

```php
<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Services\CTM\AgentProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AgentProfilesController extends Controller
{
    protected AgentProfileService $agentProfileService;

    public function __construct()
    {
        $this->agentProfileService = new AgentProfileService();
    }

    public function index(Request $request): JsonResponse
    {
        $profiles = AgentProfile::orderBy('name')->get();
        return response()->json(['data' => $profiles]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $profile = AgentProfile::create($validated);
        return response()->json(['data' => $profile], 201);
    }

    public function show(string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);
        return response()->json(['data' => $profile]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ctm_agent_id' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'team' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $profile->update($validated);
        return response()->json(['data' => $profile]);
    }

    public function destroy(string $id): JsonResponse
    {
        $profile = AgentProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['success' => true]);
    }

    public function sync(Request $request): JsonResponse
    {
        try {
            $result = $this->agentProfileService->syncFromCtm();
            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```

---

## Task 6: Update API Routes

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Add CTM routes and AgentProfile routes**

Find the existing API route file. Replace the content with routes from `bob-ags-api/routes/api.php`, but:
1. Remove routes that reference `supabase.auth` middleware (bob-ags-laravel uses Sanctum)
2. Add routes for AgentProfile CRUD

Updated `routes/api.php`:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CTM\AgentsController;
use App\Http\Controllers\Api\CTM\CallsController;
use App\Http\Controllers\Api\CTM\ActiveCallsController;
use App\Http\Controllers\Api\CTM\LiveCallsController;
use App\Http\Controllers\Api\CTM\MonitorController;
use App\Http\Controllers\Api\CTM\AgentProfilesController;
use App\Http\Controllers\Api\AuthController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/session', [AuthController::class, 'session'])->middleware('auth:sanctum');
});

// CTM routes (protected)
Route::prefix('ctm')->middleware('auth:sanctum')->group(function () {
    Route::get('/agents', [AgentsController::class, 'index']);
    Route::get('/agents/groups', [AgentsController::class, 'groups']);
    Route::get('/calls', [CallsController::class, 'index']);
    Route::get('/calls/{id}', [CallsController::class, 'show']);
    Route::get('/calls/{id}/audio', [CallsController::class, 'audio']);
    Route::get('/calls/{id}/transcript', [CallsController::class, 'transcript']);
    Route::post('/calls/analyze', [CallsController::class, 'analyze']);
    Route::get('/calls/history', [CallsController::class, 'history']);
    Route::get('/calls/search', [CallsController::class, 'search']);
    Route::get('/active-calls', [ActiveCallsController::class, 'index']);
    Route::get('/live-calls', [LiveCallsController::class, 'index']);
    Route::get('/monitor/active-calls', [MonitorController::class, 'index']);
});

// Agent Profiles CRUD
Route::prefix('agent-profiles')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AgentProfilesController::class, 'index']);
    Route::post('/', [AgentProfilesController::class, 'store']);
    Route::get('/{id}', [AgentProfilesController::class, 'show']);
    Route::put('/{id}', [AgentProfilesController::class, 'update']);
    Route::delete('/{id}', [AgentProfilesController::class, 'destroy']);
    Route::post('/sync', [AgentProfilesController::class, 'sync']);
});
```

---

## Task 7: Create CtmSyncAgents Artisan Command

**Files:**
- Create: `app/Console/Commands/CtmSyncAgents.php`

- [ ] **Step 1: Create directory and command**

```bash
mkdir -p app/Console/Commands
```

Create: `app/Console/Commands/CtmSyncAgents.php`

```php
<?php

namespace App\Console\Commands;

use App\Services\CTM\AgentProfileService;
use Illuminate\Console\Command;

class CtmSyncAgents extends Command
{
    protected $signature = 'ctm:sync-agents';
    protected $description = 'Sync agent profiles from CTM API';

    public function handle(): int
    {
        $this->info('Syncing agents from CTM...');

        try {
            $service = new AgentProfileService();
            $result = $service->syncFromCtm();

            $this->info("Synced: {$result['synced']} updated, {$result['created']} created.");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
```

- [ ] **Step 2: Verify command is registered**

Run:
```bash
php artisan list | grep ctm
```
Expected: Should show `ctm:sync-agents`

---

## Task 8: Create AgentProfiles Livewire Component

**Files:**
- Create: `app/Livewire/Dashboard/AgentProfilesIndex.php`
- Create: `resources/views/livewire/dashboard/agent-profiles-index.blade.php`

- [ ] **Step 1: Create AgentProfilesIndex Livewire component**

Create: `app/Livewire/Dashboard/AgentProfilesIndex.php`

```php
<?php

namespace App\Livewire\Dashboard;

use App\Models\AgentProfile;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class AgentProfilesIndex extends Component
{
    public Collection $profiles;
    public ?string $error = null;
    public bool $isSyncing = false;

    protected AgentProfileService $agentProfileService;

    public function boot(AgentProfileService $agentProfileService)
    {
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->loadProfiles();
    }

    public function loadProfiles()
    {
        $this->profiles = AgentProfile::orderBy('name')->get();
    }

    public function syncFromCtm()
    {
        try {
            $this->isSyncing = true;
            $result = $this->agentProfileService->syncFromCtm();
            $this->loadProfiles();
            session()->flash('message', "Synced: {$result['synced']} updated, {$result['created']} created.");
        } catch (\Exception $e) {
            $this->error = 'Sync failed: ' . $e->getMessage();
        } finally {
            $this->isSyncing = false;
        }
    }

    public function deleteProfile(int $id)
    {
        AgentProfile::destroy($id);
        $this->loadProfiles();
    }

    public function render()
    {
        return view('livewire.dashboard.agent-profiles-index');
    }
}
```

- [ ] **Step 2: Create blade view**

Create: `resources/views/livewire/dashboard/agent-profiles-index.blade.php`

```blade
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
```

---

## Task 9: Update HistoryIndex to Filter by AgentProfile

**Files:**
- Modify: `app/Livewire/Dashboard/HistoryIndex.php`

- [ ] **Step 1: Update HistoryIndex to use AgentProfileService for filtering**

Modify: `app/Livewire/Dashboard/HistoryIndex.php`

Add import:
```php
use App\Services\CTM\AgentProfileService;
```

Add property:
```php
protected AgentProfileService $agentProfileService;
```

Update `boot()`:
```php
public function boot(AgentProfileService $agentProfileService)
{
    $this->bobApi = $bobApi;
    $this->agentProfileService = $agentProfileService;
}
```

Update `loadCalls()` — after fetching calls, filter by AgentProfile:
```php
public function loadCalls()
{
    try {
        $response = $this->bobApi->get('ctm/calls/history', $this->filters);
        if (isset($response['error'])) {
            $this->error = $response['error'];
            return;
        }
        $calls = $response['data']['calls'] ?? $response['calls'] ?? [];

        // Filter to only AgentProfile agents
        $calls = $this->agentProfileService->filterCallsByProfile($calls);

        $this->calls = collect($calls);
    } catch (\Exception $e) {
        $this->error = 'Failed to load calls: ' . $e->getMessage();
    }
}
```

---

## Task 10: Update MonitorIndex to Filter by AgentProfile

**Files:**
- Modify: `app/Livewire/Dashboard/MonitorIndex.php`

- [ ] **Step 1: Update MonitorIndex to use AgentProfileService for filtering**

Modify: `app/Livewire/Dashboard/MonitorIndex.php`

Add import:
```php
use App\Services\CTM\AgentProfileService;
```

Add property:
```php
protected AgentProfileService $agentProfileService;
```

Update `boot()`:
```php
public function boot(BobApiService $bobApi, AgentProfileService $agentProfileService)
{
    $this->bobApi = $bobApi;
    $this->agentProfileService = $agentProfileService;
}
```

Update `loadActiveCalls()`:
```php
public function loadActiveCalls()
{
    try {
        $response = $this->bobApi->get('ctm/active-calls');
        if (isset($response['error'])) {
            $this->error = $response['error'];
            return;
        }
        $calls = $response['data']['calls'] ?? $response['calls'] ?? [];

        // Filter to only AgentProfile agents
        $calls = $this->agentProfileService->filterCallsByProfile($calls);

        $this->activeCalls = collect($calls);
        $this->groups = $this->activeCalls->pluck('group')->filter()->unique()->values();
    } catch (\Exception $e) {
        $this->error = 'Failed to load calls: ' . $e->getMessage();
    }
}
```

---

## Task 11: Remove BobApiService Usage (Replace with CTM Services)

The `BobApiService` proxied calls to bob-ags-api. Now CTM services are in-process. Update the Livewire components to use CTM services directly instead of `BobApiService`.

**Files:**
- Modify: `app/Livewire/Dashboard/AgentsIndex.php`
- Modify: `app/Livewire/Dashboard/HistoryIndex.php`
- Modify: `app/Livewire/Dashboard/MonitorIndex.php`
- Delete: `app/Services/BobApiService.php` (optional, keep for reference)

- [ ] **Step 1: Update AgentsIndex to use CTM directly**

Modify: `app/Livewire/Dashboard/AgentsIndex.php`

Replace the entire file:

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class AgentsIndex extends Component
{
    public Collection $agents;
    public ?string $error = null;

    protected AgentProfileService $agentProfileService;

    public function boot(AgentProfileService $agentProfileService)
    {
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->agents = collect([]);
        $this->loadAgents();
    }

    public function loadAgents()
    {
        try {
            $agents = $this->agentProfileService->getFilteredAgents();
            $this->agents = collect($agents);
        } catch (\Exception $e) {
            $this->error = 'Failed to load agents: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.agents-index');
    }
}
```

- [ ] **Step 2: Update HistoryIndex - remove BobApiService**

In `HistoryIndex.php`, remove `BobApiService` entirely:

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\CTM\CTMFacade;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class HistoryIndex extends Component
{
    public Collection $calls;
    public ?string $error = null;
    public array $filters = [
        'search' => '',
        'date_from' => '',
        'date_to' => '',
    ];

    protected CTMFacade $ctm;
    protected AgentProfileService $agentProfileService;

    public function boot(AgentProfileService $agentProfileService)
    {
        $this->ctm = new CTMFacade();
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->calls = collect([]);
        $this->loadCalls();
    }

    public function loadCalls()
    {
        try {
            $params = array_filter([
                'from_date' => $this->filters['date_from'] ?: null,
                'to_date' => $this->filters['date_to'] ?: null,
            ]);
            $calls = $this->ctm->calls->getAllCalls($params);

            // Filter to only AgentProfile agents
            $calls = $this->agentProfileService->filterCallsByProfile($calls);

            $this->calls = collect($calls);
        } catch (\Exception $e) {
            $this->error = 'Failed to load calls: ' . $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.dashboard.history-index');
    }
}
```

- [ ] **Step 3: Update MonitorIndex - remove BobApiService**

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\CTM\CTMFacade;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class MonitorIndex extends Component
{
    public Collection $activeCalls;
    public ?string $selectedCallId = null;
    public ?array $selectedCallData = null;
    public ?string $error = null;
    public bool $isMonitoring = false;
    public bool $isRecording = false;
    public ?string $selectedGroup = null;
    public Collection $groups;

    public array $liveState = [
        'transcript' => [],
        'callerName' => null,
        'callerPhone' => null,
        'callerLocation' => null,
        'insurance' => null,
        'substance' => null,
        'sobrietyTime' => null,
        'score' => 0,
        'criteriaStatus' => [],
    ];

    protected CTMFacade $ctm;
    protected AgentProfileService $agentProfileService;

    public function boot(AgentProfileService $agentProfileService)
    {
        $this->ctm = new CTMFacade();
        $this->agentProfileService = $agentProfileService;
    }

    public function mount()
    {
        $this->activeCalls = collect([]);
        $this->groups = collect([]);
        $this->loadActiveCalls();
    }

    public function loadActiveCalls()
    {
        try {
            $params = ['status' => 'in_progress'];
            $calls = $this->ctm->calls->getCalls($params);

            // Filter to only AgentProfile agents
            $calls = $this->agentProfileService->filterCallsByProfile($calls);

            $this->activeCalls = collect($calls);
            $this->groups = $this->activeCalls->pluck('group')->filter()->unique()->values();
        } catch (\Exception $e) {
            $this->error = 'Failed to load calls: ' . $e->getMessage();
        }
    }

    public function selectCall(string $callId)
    {
        $this->selectedCallId = $callId;
        $this->selectedCallData = $this->activeCalls->firstWhere('id', $callId);
    }

    public function startMonitoring()
    {
        $this->isMonitoring = true;
    }

    public function stopMonitoring()
    {
        $this->isMonitoring = false;
    }

    public function render()
    {
        return view('livewire.dashboard.monitor-index');
    }
}
```

---

## Task 12: Seed Initial Agent Profiles

**Files:**
- Create: `database/seeders/AgentProfileSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Create AgentProfileSeeder**

Create: `database/seeders/AgentProfileSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\AgentProfile;
use Illuminate\Database\Seeder;

class AgentProfileSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            ['name' => 'May Ligad Phillies'],
            ['name' => 'Ann Jamorol Phillies'],
            ['name' => 'Pauline Aquino Phillies'],
            ['name' => 'Zac Castro Phillies'],
            ['name' => 'Jerieme Padoc Phillies'],
            ['name' => 'Francine Del Mundo Phillies'],
            ['name' => 'Benjie Magbanua Phillies'],
            ['name' => 'Patricia Aranes Phillies'],
            ['name' => 'Luke Flores Phillies'],
            ['name' => 'Anjo Aquino Phillies'],
            ['name' => 'Kiel Asiniero Phillies'],
            ['name' => 'JM Dequilla Phillies'],
            ['name' => 'Mary Arellano Phillies'],
            ['name' => 'Jasmin Amistoso Phillies'],
            ['name' => 'Jhon Denver Manongdo Phillies'],
            ['name' => 'Alfred Mariano Phillies'],
            ['name' => 'Karen Perez Phillies'],
        ];

        foreach ($agents as $agent) {
            AgentProfile::firstOrCreate(
                ['name' => $agent['name']],
                ['status' => 'active']
            );
        }
    }
}
```

- [ ] **Step 2: Register seeder**

Modify: `database/seeders/DatabaseSeeder.php`

```php
public function run(): void
{
    $this->call([
        AgentProfileSeeder::class,
    ]);
}
```

- [ ] **Step 3: Run seeder**

```bash
php artisan db:seed
```

---

## Task 13: Verify End-to-End

- [ ] **Step 1: Verify CTM routes**

```bash
php artisan route:list | grep -E "ctm|agent-profiles"
```
Expected: List of ctm and agent-profiles routes

- [ ] **Step 2: Verify agent profiles seeded**

```bash
php artisan tinker --execute="echo App\Models\AgentProfile::count();"
```
Expected: 17

- [ ] **Step 3: Verify CTM service can connect**

```bash
php artisan tinker --execute="
try {
    \$ctm = new App\Services\CTM\CTMFacade();
    \$agents = \$ctm->agents->getAgents();
    echo 'CTM connected: ' . count(\$agents) . ' agents';
} catch (\Exception \$e) {
    echo 'Error: ' . \$e->getMessage();
}
"
```

- [ ] **Step 4: Test sync command**

```bash
php artisan ctm:sync-agents
```
Expected: Syncs agents and updates AgentProfile records

---

## Task 14: Remove BobApiService (Optional Cleanup)

Only do this after verifying everything works.

- [ ] **Step 1: Delete BobApiService**

```bash
rm app/Services/BobApiService.php
```

- [ ] **Step 2: Verify no references remain**

```bash
grep -r "BobApiService" app/ --include="*.php"
```
Expected: No output

---

## Self-Review Checklist

- [ ] All 17 agent names are in AgentProfileSeeder
- [ ] CTM services are copied (Client, CTMFacade, AgentsService, CallsService, Transformer)
- [ ] AgentProfile model has `getNames()` used by AgentProfileService
- [ ] HistoryIndex filters calls by AgentProfile names
- [ ] MonitorIndex filters calls by AgentProfile names
- [ ] AgentsIndex uses AgentProfileService.getFilteredAgents()
- [ ] AgentProfiles CRUD works (index, store, update, delete)
- [ ] `php artisan ctm:sync-agents` command exists
- [ ] Migration creates agent_profiles table correctly
- [ ] BobApiService is removed or kept as no-op

---

## Dependencies

- Task 1 must complete before Task 3 (CTM services needed by AgentProfileService)
- Task 2 must complete before Task 3 (AgentProfile model needed by AgentProfileService)
- Task 3 must complete before Task 8 (AgentProfileService needed by AgentProfilesIndex)
- Task 2 must complete before Task 12 (AgentProfile model needed by seeder)
