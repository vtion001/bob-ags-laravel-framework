# Next.js to Laravel + Inertia.js Migration Design

## Overview

Migrate the bob-ags Next.js frontend application into the bob-ags-laravel Laravel backend, replacing Supabase authentication with Laravel native auth (Breeze).

## Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Laravel App                           │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Routes    │  │ Controllers  │  │    Models     │  │
│  │  (web.php)  │→ │  (Inertia)   │→ │  (Eloquent)   │  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
│         ↑                                           │    │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Breeze    │  │   Inertia   │  │   Services    │  │
│  │   (Auth)    │  │   (React)   │  │ (CTM, FastAPI)│  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
│                        │                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         React Components (migrated)                 │ │
│  │   resources/js/components/, hooks/, lib/            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              FastAPI (preserved)                    │ │
│  │   fastapi/ - CTM API proxy with Redis caching      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Current State

### Frontend (bob-ags - Next.js)
- **Framework**: Next.js 16.1.6, React 19.2.4
- **UI**: Tailwind CSS 4.2, Radix UI components
- **Auth**: Supabase SSR authentication
- **API**: Custom API routes in `app/api/`
- **Components**: `components/ui/` (Radix-based), `components/dashboard/`, `components/monitor/`, `components/history/`, `components/settings/`, `components/call-detail/`
- **Hooks**: `hooks/` for API calls and state management
- **Lib**: `lib/` for utilities and API client

### Backend (bob-ags-laravel - Laravel)
- **Framework**: Laravel (PHP)
- **Auth**: Not yet configured
- **API**: `routes/api.php` with existing controllers
- **Services**: `app/Services/` (BobApiService, FastApiService, CTM services)
- **FastAPI**: `fastapi/` - Python FastAPI for CTM proxy with Redis

### Secondary API (bob-ags-api - to be archived)
- Legacy Laravel API, no git history
- Will be superseded by the merged application

## Migration Phases

### Phase 1: Laravel Foundation Setup

1. **Install Inertia.js**
   ```bash
   composer require inertiajs/inertia-laravel
   ```

2. **Install Laravel Breeze**
   ```bash
   composer require laravel/breeze --dev
   php artisan breeze:install api
   ```

3. **Install React adapter for Vite**
   ```bash
   npm install @inertiajs/react @vitejs/plugin-react
   ```

4. **Configure Vite for React**
   - Update `vite.config.js` to use `@vitejs/plugin-react`
   - Set up React JSX support

5. **Create Inertia root template**
   - Modify `resources/views/app.blade.php` for Inertia
   - Add CSRF token handling
   - Add Ziggy route helper

### Phase 2: Authentication Migration

1. **Remove Supabase auth dependencies**
   - Remove `@supabase/ssr` and `@supabase/supabase-js` packages
   - Remove `lib/supabase.ts` and related files

2. **Configure Laravel Breeze**
   - Install Breeze with React stack
   - Generate auth views/routes
   - Keep Breeze controllers, modify for Inertia responses

3. **Create Inertia-based auth pages**
   - `resources/js/pages/auth/login.tsx`
   - `resources/js/pages/auth/register.tsx`
   - `resources/js/pages/auth/forgot-password.tsx`
   - `resources/js/pages/auth/reset-password.tsx`

4. **Migrate AuthMessageHandler**
   - Replace Supabase `onAuthStateChange` with Laravel session checks
   - Use `@initiator` directive from Laravel for user hydration

5. **Create useAuth hook**
   - Replace Supabase `useSession` with Laravel authenticated session

### Phase 3: Page Migration

| Next.js Route | Inertia Page | Notes |
|---------------|--------------|-------|
| `/` | `/` (dashboard) | Main entry, redirect to dashboard |
| `/dashboard` | Dashboard page | Analytics, stats cards |
| `/history` | History page | Call history table |
| `/monitor` | Monitor page | Live call monitoring |
| `/settings` | Settings page | User preferences |
| `/call-detail/[id]` | Call detail page | Individual call view |
| `/call-detail` | Call detail page | With query params |

### Phase 4: Component Migration

1. **UI Components** (`components/ui/`)
   - Migrate to `resources/js/components/ui/`
   - Keep Radix UI primitives
   - Update imports to use new paths

2. **Feature Components**
   - `components/Analytics.tsx` → `resources/js/components/`
   - `components/CallTable.tsx` → `resources/js/components/`
   - `components/Navbar.tsx` → `resources/js/components/`
   - `components/StatsCard.tsx` → `resources/js/components/`
   - `components/ScoreCircle.tsx` → `resources/js/components/`
   - `components/EmptyState.tsx` → `resources/js/components/`

3. **Module Components**
   - `components/dashboard/` → `resources/js/components/dashboard/`
   - `components/history/` → `resources/js/components/history/`
   - `components/monitor/` → `resources/js/components/monitor/`
   - `components/settings/` → `resources/js/components/settings/`
   - `components/call-detail/` → `resources/js/components/call-detail/`

### Phase 5: Hook & Library Migration

1. **Migrate hooks/**
   - `hooks/use-api.ts` → `resources/js/hooks/use-api.ts`
   - Any custom hooks → `resources/js/hooks/`

2. **Migrate lib/**
   - `lib/api.ts` → Laravel API routes (api.php)
   - `lib/utils.ts` → `resources/js/lib/utils.ts`
   - `lib/*.ts` → Review and migrate as needed

3. **API Client migration**
   - Replace `lib/api.ts` fetch calls with Laravel route URLs
   - Use Ziggy (`route()` helper in JS) for named routes

### Phase 6: Service & API Integration

1. **Preserve existing Laravel services**
   - `app/Services/BobApiService.php`
   - `app/Services/FastApiService.php`
   - `app/Services/CTM/` (keep intact)

2. **Create Laravel API routes**
   - Mirror Next.js API routes in `routes/api.php`
   - Use existing controllers or create new ones

3. **Keep FastAPI for CTM**
   - `fastapi/` remains for CTM API proxy
   - Laravel routes will proxy to FastAPI when needed

### Phase 7: Configuration & Cleanup

1. **Configure CORS**
   - Allow frontend requests to Laravel
   - Set up proper session/CORS headers

2. **Environment configuration**
   - Move Supabase env vars to Laravel config
   - Keep FastAPI env vars in `fastapi/.env`

3. **Remove legacy files**
   - Delete `/Users/archerterminez/Desktop/REPOSITORY/bob-ags/` (migrated)
   - Archive `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-api/` (superseded)

4. **Update documentation**
   - Update README.md
   - Update IMPLEMENTATION.md

## File Mapping

### Next.js → Laravel (resources/js/)

| Next.js Path | Laravel Path |
|--------------|--------------|
| `app/layout.tsx` | `resources/js/components/Layout.tsx` |
| `app/page.tsx` | `resources/js/pages/Dashboard.tsx` |
| `app/globals.css` | `resources/css/app.css` |
| `components/ui/` | `resources/js/components/ui/` |
| `components/*.tsx` | `resources/js/components/` |
| `hooks/` | `resources/js/hooks/` |
| `lib/` | `resources/js/lib/` |
| `services/` | `app/Services/` (existing) |

## Notes

- **Supabase preserved for**: Realtime features (if needed) - can be kept as optional
- **FastAPI preserved**: CTM API proxy with Redis caching remains in `fastapi/`
- **Radix UI kept**: All Radix components remain usable with Inertia.js
- **Tailwind preserved**: Tailwind 4 configuration in Laravel

## Success Criteria

1. All Next.js pages render correctly via Laravel + Inertia
2. User authentication works via Laravel Breeze (session-based)
3. API calls to CTM/FastAPI services work through Laravel
4. No Supabase auth dependency remains
5. All React components function identically in new architecture
