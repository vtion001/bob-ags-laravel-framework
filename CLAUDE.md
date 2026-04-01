# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **hybrid Laravel + FastAPI application** for call tracking and quality assurance. The Laravel app serves as the main web application with Inertia.js/React frontend, while a Python FastAPI service acts as a CTM (Call Tracking Metrics) API proxy with Redis caching.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+) with Inertia.js
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + TypeScript
- **Python Backend**: FastAPI with Redis caching
- **Database**: SQLite (local dev), Supabase (production data)
- **Auth**: Laravel Sanctum
- **Real-time**: AssemblyAI for live call transcription

## Directory Structure

```
├── app/
│   ├── Http/Controllers/
│   │   ├── Api/CTM/          # CTM API controllers (proxy to FastAPI)
│   │   └── Auth/             # Laravel Breeze auth controllers
│   ├── Livewire/Dashboard/   # Livewire components (legacy dashboard)
│   ├── Models/               # Eloquent models
│   └── Services/
│       ├── CTM/              # CTM API integration services
│       └── Database/         # Supabase client
├── config/
│   └── services.php          # Third-party credentials (CTM, Supabase, etc.)
├── database/
│   ├── migrations/            # Laravel migrations
│   └── seeders/              # Database seeders
├── fastapi/                  # Python FastAPI backend
│   ├── app/
│   │   ├── routers/          # API routes (agents, calls, active_calls, live_calls)
│   │   ├── services/         # Redis caching, CTM client
│   │   └── models/           # Pydantic models
│   └── config.py             # FastAPI settings
├── resources/js/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── call-detail/      # Call detail panel components
│   │   └── monitor/          # Live monitoring components
│   ├── hooks/                # Custom React hooks (dashboard, monitor, calls)
│   ├── lib/
│   │   ├── api/              # API client utilities
│   │   ├── ctm/             # CTM service clients
│   │   └── realtime/        # AssemblyAI real-time integration
│   └── pages/               # Inertia page components (Dashboard, History, Monitor, etc.)
├── routes/
│   ├── web.php              # Main web routes (Inertia pages)
│   ├── api.php              # Internal API routes (Sanctum auth)
│   └── auth.php             # Auth routes (Laravel Breeze)
└── tests/
    ├── Feature/              # Feature tests
    └── Unit/                 # Unit tests
```

## Docker Development

This project runs entirely in Docker containers via `docker compose`.

**Key ports:**
- `http://localhost:8080` - Laravel app (main entry point)
- `http://localhost:5173` - Vite HMR server (frontend hot reload)
- `http://localhost:8001` - FastAPI backend
- `http://localhost:6380` - Redis

**CRITICAL - Frontend changes:** The Vite container bakes source files into its image at build time. After modifying any React/TS/Vite files, you MUST rebuild the Vite container:

```bash
# After any frontend file changes
docker compose build vite
docker compose up -d vite
```

The Laravel app container (`docker compose up -d app`) has live volume mounts (`.:/var/www`) so PHP code changes are reflected immediately without rebuild.

### Docker Commands

```bash
# Start all containers
docker compose up -d

# Restart a specific service
docker compose restart app

# View logs
docker compose logs app --tail=50
docker compose logs vite --tail=50

# Run artisan commands inside container
docker compose exec app php artisan <command>

# Rebuild a specific service
docker compose build <service>
docker compose up -d <service>
```

### Laravel (PHP)

```bash
# Run Laravel server only
docker compose exec app php artisan serve

# Queue worker
docker compose exec app php artisan queue:listen --tries=1

# Run migrations
docker compose exec app php artisan migrate

# Run tests
docker compose exec app php artisan test

# Run specific test
docker compose exec app php artisan test --filter=TestName

# Clear caches
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan view:clear
```

### Frontend (Node.js)

```bash
# Note: Vite runs inside the Vite container, not on host
# Source is baked into image at build time
docker compose build vite && docker compose up -d vite
```

### FastAPI (Python)

```bash
# Start FastAPI server
cd fastapi && ./run.sh

# Or directly
cd fastapi && uvicorn main:app --reload --port 8000
```

### Testing

```bash
# All tests (Laravel)
docker compose exec app php artisan test

# PHPUnit directly
docker compose exec app ./vendor/bin/phpunit

# Single test file
docker compose exec app ./vendor/bin/phpunit tests/Feature/ExampleTest.php

# With coverage
docker compose exec app ./vendor/bin/phpunit --coverage-html coverage
```

## Architecture Notes

### API Flow

1. **Frontend → Laravel API** (`/api/ctm/*`): Internal routes protected by Sanctum auth
2. **Laravel → FastAPI** (`services.ctm.access_key/secret_key`): Proxies CTM requests with caching
3. **FastAPI → CTM API**: Fetches data from Call Tracking Metrics, caches in Redis

### Key API Controllers

- `app/Http/Controllers/Api/CTM/CallsController.php` - Call history, transcripts, recordings
- `app/Http/Controllers/Api/CTM/AgentsController.php` - Agent data
- `app/Http/Controllers/Api/CTM/ActiveCallsController.php` - Live active calls
- `app/Http/Controllers/Api/CTM/LiveCallsController.php` - Real-time call monitoring

### CTM Integration

The CTM (Call Tracking Metrics) service is accessed through:
- **Laravel**: `app/Services/CTM/CTMFacade.php` - PHP client
- **FastAPI**: `fastapi/app/services/ctm_client.py` - Python client with Redis caching

Cache TTLs (in FastAPI):
- Agents: 5 minutes
- Calls: 2 minutes
- Active calls: 30 seconds

### Auth Flow

- Laravel Sanctum for API authentication
- Breeze for web auth (Inertia + React)
- Supabase for additional database operations

### Frontend Data Fetching

React hooks in `resources/js/hooks/dashboard/` handle data fetching:
- `useDashboard.ts` - Dashboard stats
- `useCallHistory.ts` - Call history with filters
- `useAgentProfiles.ts` - Agent profile data
- `useMonitorPage.ts` - Live monitoring

### Real-time Features

- AssemblyAI for live transcription (`resources/js/lib/realtime/assemblyai-realtime.ts`)
- Redis pub/sub for live updates (via FastAPI)

## Environment Variables

Key environment variables (see `.env.example`):

```env
# CTM API
CTM_ACCESS_KEY=
CTM_SECRET_KEY=
CTM_ACCOUNT_ID=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# FastAPI
FASTAPI_URL=http://localhost:8000

# Redis (for FastAPI caching)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Notes

- The `resources/js/components/ui/` directory contains shadcn/ui components
- Livewire components in `app/Livewire/Dashboard/` are legacy - prefer Inertia/React
- The FastAPI backend must be running for CTM data to be available
- SQLite database at `database/database.sqlite` for local development

## GodView Activity Tracking System

A comprehensive activity logging and debugging toolbar included in the app.

### Components
- `app/Services/GodView/GodViewService.php` - Core logging service
- `app/Http/Middleware/GodViewMiddleware.php` - Captures requests/queries
- `app/Http/Controllers/GodViewController.php` - API + page controller
- `app/Models/ActivityLog.php` - Eloquent model for activity logs
- `resources/js/components/GodView/Toolbar.tsx` - Bottom-right floating toolbar
- `resources/js/pages/GodView.tsx` - Full dashboard page at `/godview`

### Routes
- `GET /godview` - Full GodView dashboard (requires `is_god = true`)
- `GET /api/godview/data` - Activity logs API
- `GET /api/godview/stats` - Stats API
- `POST /api/godview/clear` - Clear old logs
- `POST /api/godview/event` - Log custom event

### Usage
Set `is_god = 1` on a user in the database to enable the toolbar. The toolbar appears as a "GV" pill in the bottom-right corner of every page for god users.

## Navigation

The app uses a **sidebar layout** (not top navbar):
- `resources/js/components/Navbar.tsx` - Contains the Sidebar component
- `resources/js/components/Layout.tsx` - Wraps all pages with sidebar + GodView toolbar
- All pages in `resources/js/pages/` import `Layout` component

## Critical Development Notes

### Vite Proxy Configuration (Docker Networking)
The `vite.config.js` proxy must use Docker service names and internal ports:
```js
proxy: {
    '/api': {
        target: 'http://app:80',  // NOT localhost:8080
        changeOrigin: true,
    },
}
```
- `app` = Docker service name (not `localhost`)
- `80` = container's internal port (not host port 8080)
- The `8080:80` port mapping means: host=8080, container internal=80

### Production Build Process
**`docker compose build vite` does NOT run `npm run build`.** It only copies source files and installs dependencies. The production build must be run separately:

```bash
# Option 1: Build inside container, copy to host
docker compose exec vite npm run build
docker cp $(docker compose ps -q vite):/app/public/build/. public/build/
docker compose restart app

# Option 2: Full rebuild flow
docker compose exec vite npm run build
docker cp $(docker compose ps -q vite):/app/public/build/. public/build/
docker compose restart app
```

The Vite container has no volume mount — its filesystem is isolated. Fresh builds stay inside the container unless copied out.

### assemblyai Package
The `assemblyai` npm package must be:
1. In `package.json` dependencies (NOT devDependencies)
2. **NOT marked as `external`** in `vite.config.js` — it must be bundled for browser use

If `assemblyai` is in `build.rollupOptions.external`, the browser will fail with:
```
Failed to resolve module specifier "assemblyai"
```

### Browser Cache After Build Changes
After rebuilding production assets, always do a **hard refresh** (`Cmd+Shift+R` / `Ctrl+Shift+R`) or disable cache in DevTools Network tab. Browser caching can cause stale JavaScript to be served.

### GodView API Authorization
GodView API routes (`/api/godview/*`) only require `auth:sanctum` but should also check `is_god = true`. Currently, any authenticated user can access GodView data APIs.

### safeJson Error Handling
The `safeJson()` helper in React hooks truncates non-JSON responses to 100 chars. This may leak sensitive HTML (e.g., error pages with stack traces) in error messages. Consider not including response body text in errors.
