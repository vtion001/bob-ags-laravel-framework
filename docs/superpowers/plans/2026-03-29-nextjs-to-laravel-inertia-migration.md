# Next.js to Laravel + Inertia.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the bob-ags Next.js frontend into bob-ags-laravel using Inertia.js, replacing Supabase auth with Laravel Breeze.

**Architecture:** Laravel will serve as the full-stack framework with Inertia.js bridging React components to Laravel routes/controllers. All React pages will be Inertia pages rendered server-side. Laravel Breeze provides session-based authentication. FastAPI remains for CTM API proxying.

**Tech Stack:** Laravel 11, Inertia.js, React 19, Vite, Laravel Breeze, Tailwind CSS 4, Radix UI

---

## File Structure

```
bob-ags-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Inertia/                    (new)
│   │   │       ├── DashboardController.php
│   │   │       ├── HistoryController.php
│   │   │       ├── MonitorController.php
│   │   │       ├── SettingsController.php
│   │   │       └── CallDetailController.php
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php   (new)
│   └── Providers/
│       └── AppServiceProvider.php
├── resources/
│   ├── js/
│   │   ├── app.jsx                          (convert from .js)
│   │   ├── components/
│   │   │   ├── Layout.tsx                   (new - main layout)
│   │   │   ├── Navbar.tsx                   (migrated)
│   │   │   ├── ui/                          (migrated)
│   │   │   ├── dashboard/                   (migrated)
│   │   │   ├── history/                     (migrated)
│   │   │   ├── monitor/                     (migrated)
│   │   │   ├── settings/                    (migrated)
│   │   │   └── call-detail/                 (migrated)
│   │   ├── hooks/                           (migrated)
│   │   ├── lib/                             (migrated)
│   │   └── pages/                           (migrated)
│   │       ├── Dashboard.tsx
│   │       ├── History.tsx
│   │       ├── Monitor.tsx
│   │       ├── Settings.tsx
│   │       └── CallDetail.tsx
│   ├── css/
│   │   └── app.css                          (migrated globals.css)
│   └── views/
│       ├── app.blade.php                    (new - Inertia root)
│       └── layouts/
│           └── app.blade.php                (existing)
├── routes/
│   ├── web.php
│   └── api.php
├── config/
│   └── inertia.php                         (new)
└── vite.config.js                           (modify for React)
```

---

## Phase 1: Laravel Foundation Setup

### Task 1: Install Inertia.js and React Dependencies

**Files:**
- Modify: `composer.json` (via composer)
- Modify: `package.json` (via npm)
- Modify: `vite.config.js`

- [ ] **Step 1: Install Inertia.js server package**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel && composer require inertiajs/inertia-laravel
```

- [ ] **Step 2: Install Inertia.js React client and Vite React plugin**

```bash
npm install @inertiajs/react react react-dom
npm install -D @vitejs/plugin-react
```

- [ ] **Step 3: Update vite.config.js for React**

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
```

- [ ] **Step 4: Rename app.js to app.jsx**

```bash
mv resources/js/app.js resources/js/app.jsx
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: install Inertia.js and React dependencies"
```

---

### Task 2: Configure Inertia Root Template

**Files:**
- Create: `resources/views/app.blade.php`
- Modify: `app/Http/Middleware/HandleInertiaRequests.php` (create)

- [ ] **Step 1: Create app.blade.php root template**

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'BOB AGS') }}</title>
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
```

- [ ] **Step 2: Create HandleInertiaRequests middleware**

```bash
php artisan make:middleware HandleInertiaRequests
```

- [ ] **Step 3: Implement HandleInertiaRequests.php**

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ] : null,
            'ziggy' => fn () => [
                'urls' => fn () => (new \TLCAskl\Ziggy\Ziggy)->toArray(),
            ],
        ]);
    }
}
```

- [ ] **Step 4: Register middleware in bootstrap/app.php**

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
})
```

- [ ] **Step 5: Install Ziggy for route helper in JS**

```bash
npm install ziggy
composer require tightenco/ziggy
```

- [ ] **Step 6: Publish Ziggy config**

```bash
php artisan vendor:publish --provider="Tightenco\Ziggy\ZiggyServiceProvider"
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: configure Inertia root template and middleware"
```

---

### Task 3: Install Laravel Breeze for Authentication

**Files:**
- Modify: `composer.json` (via composer)
- Create: `app/Http/Controllers/Auth/` (authentication controllers)
- Create: `resources/js/pages/auth/` (Inertia auth pages)
- Modify: `routes/web.php`

- [ ] **Step 1: Install Laravel Breeze**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel && composer require laravel/breeze --dev
```

- [ ] **Step 2: Install Breeze with React stack (api-only for SPA mode, then manually create Inertia pages)**

```bash
php artisan breeze:install api
```

Note: We install "api" because it sets up Sanctum. We will manually create Inertia pages instead of using the Blade views.

- [ ] **Step 3: Generate Sanctum middleware**

```bash
php artisan install:api
```

- [ ] **Step 4: Create AuthenticatedSessionController for Inertia**

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    public function create()
    {
        return Inertia::render('auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
```

- [ ] **Step 5: Create web routes for auth**

```php
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: install Laravel Breeze and configure auth controller"
```

---

## Phase 2: Authentication Migration

### Task 4: Create Login Page (Inertia React Component)

**Files:**
- Create: `resources/js/pages/auth/Login.tsx`
- Modify: `resources/js/app.jsx`

- [ ] **Step 1: Create Login.tsx page**

```tsx
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">BOB AGS Login</h1>

                {status && (
                    <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            autoFocus
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Update app.jsx to use Inertia**

```tsx
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import './bootstrap';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        return pages[`./pages/${name}.tsx`]();
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
```

- [ ] **Step 3: Create pages directory**

```bash
mkdir -p resources/js/pages/auth
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: create Login page and configure Inertia app"
```

---

### Task 5: Create Main Layout with Navbar

**Files:**
- Create: `resources/js/components/Layout.tsx`
- Create: `resources/js/pages/Dashboard.tsx` (basic)
- Modify: `resources/js/app.jsx`

- [ ] **Step 1: Create Layout.tsx**

```tsx
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
    auth?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export default function Layout({ children, auth }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar auth={auth} />
            <main>{children}</main>
        </div>
    );
}
```

- [ ] **Step 2: Create Navbar.tsx (migrated from Next.js)**

```tsx
import { Link, usePage } from '@inertiajs/react';

export default function Navbar({ auth }: LayoutProps['auth']) {
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', current: url === '/dashboard' },
        { name: 'History', href: '/history', current: url === '/history' },
        { name: 'Monitor', href: '/monitor', current: url === '/monitor' },
        { name: 'Settings', href: '/settings', current: url === '/settings' },
    ];

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                                BOB AGS
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                        item.current
                                            ? 'text-gray-900 border-b-2 border-indigo-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {auth ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700">{auth.name}</span>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Log out
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
```

- [ ] **Step 3: Create basic Dashboard.tsx page**

```tsx
import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';

export default function Dashboard({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </div>
        </Layout>
    );
}
```

- [ ] **Step 4: Create Dashboard route in web.php**

```php
use App\Http\Controllers\DashboardController;

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/', fn () => redirect()->route('dashboard'));
});
```

- [ ] **Step 5: Create DashboardController**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: create main layout with Navbar and Dashboard page"
```

---

## Phase 3: Page Migration

### Task 6: Migrate Dashboard Components

**Files:**
- Create: `resources/js/pages/History.tsx`
- Create: `resources/js/pages/Monitor.tsx`
- Create: `resources/js/pages/Settings.tsx`
- Create: `resources/js/pages/CallDetail.tsx`
- Create: `resources/js/components/StatsCard.tsx`
- Create: `resources/js/components/Analytics.tsx`
- Create: `resources/js/components/CallTable.tsx`
- Create: `resources/js/components/EmptyState.tsx`
- Create: `resources/js/components/ScoreCircle.tsx`
- Create: `resources/js/components/dashboard/` (migrated)

- [ ] **Step 1: Create History.tsx page**

```tsx
import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import CallTable from '../components/CallTable';

export default function History({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Call History</h1>
                    <CallTable />
                </div>
            </div>
        </Layout>
    );
}
```

- [ ] **Step 2: Create Monitor.tsx page**

```tsx
import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';

export default function Monitor({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Monitor</h1>
                    {/* Migrate monitor components */}
                </div>
            </div>
        </Layout>
    );
}
```

- [ ] **Step 3: Create Settings.tsx page**

```tsx
import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';

export default function Settings({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
                    {/* Migrate settings components */}
                </div>
            </div>
        </Layout>
    );
}
```

- [ ] **Step 4: Create CallDetail.tsx page**

```tsx
import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';

export default function CallDetail({ auth, callId }: PageProps & { callId?: string }) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Call Details</h1>
                    <p>Call ID: {callId}</p>
                </div>
            </div>
        </Layout>
    );
}
```

- [ ] **Step 5: Add routes for all pages**

```php
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\CallDetailController;

Route::middleware('auth')->group(function () {
    Route::get('/history', [HistoryController::class, 'index'])->name('history');
    Route::get('/monitor', [MonitorController::class, 'index'])->name('monitor');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::get('/call-detail/{id}', [CallDetailController::class, 'show'])->name('call-detail.show');
    Route::get('/call-detail', [CallDetailController::class, 'index'])->name('call-detail');
});
```

- [ ] **Step 6: Create placeholder controllers**

```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        return Inertia::render('History');
    }
}

class MonitorController extends Controller
{
    public function index()
    {
        return Inertia::render('Monitor');
    }
}

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings');
    }
}

class CallDetailController extends Controller
{
    public function index()
    {
        return Inertia::render('CallDetail', ['callId' => null]);
    }

    public function show($id)
    {
        return Inertia::render('CallDetail', ['callId' => $id]);
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: create page routes and controllers for History, Monitor, Settings, CallDetail"
```

---

### Task 7: Migrate UI Components (Radix-based)

**Files:**
- Create: `resources/js/components/ui/` (all Radix components)

- [ ] **Step 1: Migrate all UI components from Next.js `components/ui/`**

Copy each component from:
`/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/ui/` → `resources/js/components/ui/`

Key components to migrate:
- Button.tsx
- Card.tsx
- Dialog.tsx
- Dropdown-menu.tsx
- Input.tsx
- Table.tsx
- Tabs.tsx
- Select.tsx
- etc.

Note: Most Radix UI components should work with minimal changes (imports from `@radix-ui/*`).

- [ ] **Step 2: Migrate StatsCard.tsx**

```tsx
import { Card } from './ui/Card';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down';
}

export function StatsCard({ title, value, change, trend }: StatsCardProps) {
    return (
        <Card>
            <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {change && (
                    <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? '+' : '-'}{change}
                    </p>
                )}
            </div>
        </Card>
    );
}
```

- [ ] **Step 3: Migrate CallTable.tsx** (simplified initial version)

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

interface Call {
    id: string;
    agent_name: string;
    duration: number;
    score: number;
    date: string;
}

interface CallTableProps {
    calls?: Call[];
}

export default function CallTable({ calls = [] }: CallTableProps) {
    if (calls.length === 0) {
        return <div className="text-center py-8 text-gray-500">No calls found</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {calls.map((call) => (
                    <TableRow key={call.id}>
                        <TableCell>{call.agent_name}</TableCell>
                        <TableCell>{call.duration}s</TableCell>
                        <TableCell>{call.score}</TableCell>
                        <TableCell>{call.date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

- [ ] **Step 4: Migrate ScoreCircle.tsx, EmptyState.tsx, Analytics.tsx** (copy from Next.js)

Copy each file from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/` to `resources/js/components/`

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate UI components (StatsCard, CallTable, ScoreCircle, EmptyState, Analytics)"
```

---

### Task 8: Migrate Dashboard Module Components

**Files:**
- Create: `resources/js/components/dashboard/` (migrated)

- [ ] **Step 1: Copy dashboard components from Next.js**

Copy all files from:
`/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/dashboard/` → `resources/js/components/dashboard/`

- [ ] **Step 2: Create index export file**

```tsx
// resources/js/components/dashboard/index.ts
export { default as DashboardCards } from './DashboardCards';
export { default as RecentCalls } from './RecentCalls';
// ... other exports
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: migrate dashboard module components"
```

---

### Task 9: Migrate Monitor, History, Settings, CallDetail Module Components

**Files:**
- Create: `resources/js/components/monitor/`
- Create: `resources/js/components/history/`
- Create: `resources/js/components/settings/`
- Create: `resources/js/components/call-detail/`

- [ ] **Step 1: Copy monitor components from Next.js**

Copy all from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/monitor/` → `resources/js/components/monitor/`

- [ ] **Step 2: Copy history components from Next.js**

Copy all from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/history/` → `resources/js/components/history/`

- [ ] **Step 3: Copy settings components from Next.js**

Copy all from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/settings/` → `resources/js/components/settings/`

- [ ] **Step 4: Copy call-detail components from Next.js**

Copy all from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/components/call-detail/` → `resources/js/components/call-detail/`

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate module components (monitor, history, settings, call-detail)"
```

---

## Phase 4: Hook & Library Migration

### Task 10: Migrate Hooks and Lib

**Files:**
- Create: `resources/js/hooks/` (migrated)
- Create: `resources/js/lib/` (migrated)

- [ ] **Step 1: Copy hooks from Next.js**

Copy all files from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/hooks/` → `resources/js/hooks/`

- [ ] **Step 2: Update hook imports for Inertia**

Most hooks that used `swr` or `fetch` should be updated to use Inertia's `usePage` or standard React patterns:

```tsx
// Before (Next.js)
import useSWR from 'swr';
const { data } = useSWR('/api/calls', fetcher);

// After (Inertia/Laravel)
import { usePage } from '@inertiajs/react';
const { props } = usePage();
// Access data via props.calls, etc.
```

- [ ] **Step 3: Copy lib files from Next.js**

Copy all files from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/lib/` → `resources/js/lib/`

- [ ] **Step 4: Update utils.ts for Laravel context**

```tsx
// resources/js/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate hooks and lib utilities"
```

---

## Phase 5: API Integration

### Task 11: Create Laravel API Routes for CTM Data

**Files:**
- Modify: `routes/api.php`
- Modify: `app/Services/BobApiService.php`
- Modify: `app/Services/FastApiService.php`

- [ ] **Step 1: Create API routes for calls, agents, etc.**

```php
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\AgentController;

Route::middleware('auth:sanctum')->prefix('ctm')->group(function () {
    Route::get('/agents', [AgentController::class, 'index']);
    Route::get('/calls', [CallController::class, 'index']);
    Route::get('/calls/{id}', [CallController::class, 'show']);
    Route::get('/active-calls', [CallController::class, 'active']);
    Route::get('/live-calls', [CallController::class, 'live']);
});
```

- [ ] **Step 2: Create CallController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BobApiService;
use App\Services\FastApiService;
use Illuminate\Http\JsonResponse;

class CallController extends Controller
{
    public function __construct(
        protected BobApiService $bobApi,
        protected FastApiService $fastApi
    ) {}

    public function index(): JsonResponse
    {
        $calls = $this->fastApi->getCalls();
        return response()->json($calls);
    }

    public function show(string $id): JsonResponse
    {
        $call = $this->fastApi->getCall($id);
        return response()->json($call);
    }

    public function active(): JsonResponse
    {
        $calls = $this->fastApi->getActiveCalls();
        return response()->json($calls);
    }

    public function live(): JsonResponse
    {
        $calls = $this->fastApi->getLiveCalls();
        return response()->json($calls);
    }
}
```

- [ ] **Step 3: Create AgentController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BobApiService;
use Illuminate\Http\JsonResponse;

class AgentController extends Controller
{
    public function __construct(
        protected BobApiService $bobApi
    ) {}

    public function index(): JsonResponse
    {
        $agents = $this->bobApi->getAgents();
        return response()->json($agents);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: create API routes and controllers for CTM data"
```

---

## Phase 6: CSS and Styling

### Task 12: Migrate Tailwind/Globals CSS

**Files:**
- Modify: `resources/css/app.css`

- [ ] **Step 1: Copy globals.css to app.css**

Copy content from `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/app/globals.css` to `resources/css/app.css`

- [ ] **Step 2: Ensure Tailwind is configured in Laravel**

The Laravel project uses Vite with Tailwind 4 (via `@tailwindcss/postcss`). Verify `postcss.config.js` exists:

```js
export default {
    plugins: {
        '@tailwindcss/postcss': {},
    },
};
```

- [ ] **Step 3: Add app.css entry in vite.config.js**

Already configured in Task 1.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: migrate Tailwind CSS configuration"
```

---

## Phase 7: Cleanup

### Task 13: Cleanup and Verify

**Files:**
- Archive: `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/` (original Next.js app - move to backup)
- Archive: `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/` (superseded Laravel API)

- [ ] **Step 1: Move bob-ags to backup location**

```bash
mv /Users/archerterminez/Desktop/REPOSITORY/bob-ags /Users/archerterminez/Desktop/REPOSITORY/bob-ags-nextjs-ORIGINAL
```

- [ ] **Step 2: Archive bob-ags-api**

```bash
mv /Users/archerterminez/Desktop/REPOSITORY/bob-ags-api /Users/archerterminez/Desktop/REPOSITORY/bob-ags-api-ARCHIVED
```

- [ ] **Step 3: Update README.md in bob-ags-laravel**

Update to reflect the new architecture.

- [ ] **Step 4: Verify migration by running dev server**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel
npm run dev
php artisan serve
```

Visit http://localhost:8000 and verify:
- Login page renders
- Dashboard loads after login
- Navigation works

- [ ] **Step 5: Commit final state**

```bash
git add -A && git commit -m "feat: complete Next.js to Laravel Inertia migration"
```

---

## Verification Checklist

- [ ] Login page at `/login` renders correctly
- [ ] User can register/login with Laravel Breeze auth
- [ ] Dashboard page loads with layout and Navbar
- [ ] History, Monitor, Settings pages are accessible
- [ ] API routes return data from FastApiService/BobApiService
- [ ] UI components render correctly
- [ ] No Supabase dependencies remain
- [ ] `npm run dev` starts Vite dev server without errors
- [ ] `php artisan serve` starts Laravel server without errors

---

## Notes

- **bob-ags-nextjs-backup** already exists - the original Next.js app was backed up there
- **FastAPI** (`fastapi/`) remains for CTM API proxy - it's independent
- **bob-ags-api** has no git history, so no commits to preserve from it
- **Livewire** is still installed but not used in the new React/Inertia frontend
