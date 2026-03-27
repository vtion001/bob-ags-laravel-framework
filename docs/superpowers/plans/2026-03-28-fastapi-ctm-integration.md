# FastAPI CTM Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI service that sits between Laravel and CTM — caching CTM responses, handling all CTM API calls, providing async background processing for bulk operations, with Laravel queues powering continuous sync jobs.

**Architecture:**
FastAPI (`bob-ags-fastapi/`) runs on port 8000 as the sole CTM facade. It wraps CTM API calls with Redis caching (agents: 5min TTL, calls: 2min TTL, active-calls: 30sec TTL). Laravel (`bob-ags-laravel`) calls FastAPI instead of CTM directly. Laravel queues handle background jobs: periodic CTM sync (every 5 min) and bulk history backfill. Job status is stored in Redis and readable by Laravel.

**Tech Stack:** FastAPI, uvicorn, Redis, Guzzle HTTP, Laravel Queue (Redis driver), Pydantic

---

## File Structure

```
Desktop/REPOSITORY/bob-ags-fastapi/           # NEW - FastAPI service
├── main.py                        # FastAPI app entry point
├── requirements.txt               # fastapi, uvicorn, redis, guzzle, pydantic
├── config.py                      # Config: CTM credentials, Redis, port
├── app/
│   ├── __init__.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── agents.py             # /agents, /agents/groups
│   │   ├── calls.py              # /calls, /calls/history, /calls/search
│   │   ├── active_calls.py       # /active-calls
│   │   ├── live_calls.py          # /live-calls
│   │   └── sync.py               # /sync/trigger, /sync/status/{job_id}
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ctm_client.py         # CTM HTTP client (replicates Laravel CTM\Client)
│   │   ├── cache.py              # Redis caching service
│   │   └── sync_service.py       # Bulk sync logic
│   ├── models/
│   │   ├── __init__.py
│   │   ├── agents.py             # Pydantic models for agents
│   │   └── calls.py              # Pydantic models for calls
│   └── jobs/
│       ├── __init__.py
│       └── sync_history.py        # Background history sync job

bob-ags-laravel/                          # EXISTING - Modify
├── app/
│   ├── Services/
│   │   ├── FastApiService.php      # NEW - Replaces direct CTM calls
│   │   └── CTM/
│   │       └── AgentProfileService.php  # MODIFY - Call FastApiService
│   ├── Jobs/
│   │   └── CtmPeriodicSync.php     # NEW - Laravel queue job for periodic sync
│   └── Console/
│       └── Commands/
│           └── CtmPeriodicSyncCommand.php  # NEW - Scheduler command
├── config/
│   └── fastapi.php                 # NEW - FastAPI service config
├── .env                            # MODIFY - Add FASTAPI_URL, Redis config
└── routes/
    └── api.php                     # MODIFY - Remove direct CTM controllers, use FastAPI
```

---

## Pre-requisite: Verify Redis in Laravel

- [ ] **Step 1: Check Redis availability**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel && php artisan tinker --execute="try { Redis::ping(); echo 'Redis OK'; } catch (\Exception \$e) { echo 'Redis error: ' . \$e->getMessage(); }"
```

If Redis is not available, set `REDIS_HOST=127.0.0.1` and `REDIS_PASSWORD=` in `.env`.

- [ ] **Step 2: Update .env for FastAPI**

Add to `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/.env`:

```
FASTAPI_URL=http://localhost:8000
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_PORT=6379
```

---

## Task 1: Scaffold FastAPI Project

**Files:**
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/requirements.txt`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/config.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/main.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/app/__init__.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/app/routers/__init__.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/app/services/__init__.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/app/models/__init__.py`
- Create: `Desktop/REPOSITORY/bob-ags-fastapi/app/jobs/__init__.py`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers
mkdir -p /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/services
mkdir -p /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/models
mkdir -p /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/jobs
touch /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/__init__.py
touch /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/__init__.py
touch /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/services/__init__.py
touch /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/models/__init__.py
touch /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/jobs/__init__.py
```

- [ ] **Step 2: Create requirements.txt**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/requirements.txt`:

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
redis==5.0.8
httpx==0.27.2
pydantic==2.9.2
pydantic-settings==2.5.2
python-dotenv==1.0.1
```

- [ ] **Step 3: Create config.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/config.py`:

```python
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # CTM credentials (from Laravel .env)
    ctm_access_key: str = ""
    ctm_secret_key: str = ""
    ctm_account_id: str = ""
    ctm_base_url: str = "https://api.calltrackingmetrics.com/api/v1"

    # Redis
    redis_host: str = "127.0.0.1"
    redis_port: int = 6379
    redis_password: str = ""
    redis_db: int = 0

    # Cache TTLs (seconds)
    cache_ttl_agents: int = 300       # 5 minutes
    cache_ttl_calls: int = 120       # 2 minutes
    cache_ttl_active_calls: int = 30  # 30 seconds

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 4: Create main.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import agents, calls, active_calls, live_calls, sync
from app.services.cache import CacheService
import redis.asyncio as redis
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="bob-ags-fastapi",
    description="CTM API proxy with Redis caching and background jobs",
    version="1.0.0"
)

# CORS - allow Laravel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client on app state
@app.on_event("startup")
async def startup():
    app.state.redis = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        password=settings.redis_password or None,
        db=settings.redis_db,
        decode_responses=True,
    )


@app.on_event("shutdown")
async def shutdown():
    await app.state.redis.close()


# Include routers
app.include_router(agents.router, prefix="/api/ctm", tags=["Agents"])
app.include_router(calls.router, prefix="/api/ctm", tags=["Calls"])
app.include_router(active_calls.router, prefix="/api/ctm", tags=["Active Calls"])
app.include_router(live_calls.router, prefix="/api/ctm", tags=["Live Calls"])
app.include_router(sync.router, prefix="/api/sync", tags=["Sync Jobs"])


@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## Task 2: CTM Client Service

**Files:**
- Create: `app/services/ctm_client.py`
- Create: `app/services/cache.py`
- Create: `app/services/sync_service.py`

- [ ] **Step 1: Create ctm_client.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/services/ctm_client.py`:

```python
import httpx
import base64
from config import get_settings

settings = get_settings()


class CTMClient:
    """Replicates the Laravel CTM\Client — makes authenticated requests to CTM API"""

    def __init__(self):
        self.base_url = settings.ctm_base_url
        self.access_key = settings.ctm_access_key
        self.secret_key = settings.ctm_secret_key
        self.account_id = settings.ctm_account_id

    def _get_auth_header(self) -> str:
        return base64.b64encode(
            f"{self.access_key}:{self.secret_key}".encode()
        ).decode()

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Basic {self._get_auth_header()}",
            "Content-Type": "application/json",
        }

    async def get(self, endpoint: str, params: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def post(self, endpoint: str, data: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()

    def get_account_id(self) -> str:
        return self.account_id
```

- [ ] **Step 2: Create cache.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/services/cache.py`:

```python
import json
import hashlib
from functools import wraps
from config import get_settings

settings = get_settings()


def cache_key(prefix: str, params: dict | None = None) -> str:
    """Generate a cache key from prefix and params."""
    if params:
        param_str = json.dumps(params, sort_keys=True)
        hash_suffix = hashlib.md5(param_str.encode()).hexdigest()[:8]
        return f"ctm:{prefix}:{hash_suffix}"
    return f"ctm:{prefix}"


class CacheService:
    """Redis caching for CTM responses."""

    def __init__(self, redis_client):
        self.redis = redis_client

    async def get(self, key: str) -> dict | None:
        """Get cached value, returns None if not found or expired."""
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: dict, ttl: int) -> None:
        """Set cached value with TTL in seconds."""
        await self.redis.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    async def delete_prefix(self, prefix: str) -> None:
        """Delete all keys matching prefix (e.g., ctm:agents:*)."""
        pattern = f"ctm:{prefix}:*"
        async for key in self.redis.scan_iter(match=pattern):
            await self.redis.delete(key)

    async def set_job_status(self, job_id: str, status: dict) -> None:
        """Store job status (for background job tracking)."""
        await self.redis.setex(f"job:{job_id}", 3600, json.dumps(status))  # 1hr TTL

    async def get_job_status(self, job_id: str) -> dict | None:
        data = await self.redis.get(f"job:{job_id}")
        if data:
            return json.loads(data)
        return None


def with_cache(cache: CacheService, prefix: str, ttl: int):
    """Decorator to cache async function results."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, params=None, **kwargs):
            key = cache_key(prefix, params)
            cached = await cache.get(key)
            if cached is not None:
                return cached

            result = await func(*args, params=params, **kwargs)

            # Handle paginated responses
            if isinstance(result, dict):
                if "agents" in result:
                    await cache.set(key, result, ttl)
                    return result
                if "calls" in result:
                    await cache.set(key, result, ttl)
                    return result

            await cache.set(key, result, ttl)
            return result
        return wrapper
    return decorator
```

- [ ] **Step 3: Create sync_service.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/services/sync_service.py`:

```python
import uuid
import asyncio
from datetime import datetime, timedelta
from ctm_client import CTMClient
from cache import CacheService

ctm = CTMClient()


async def trigger_history_sync(redis_client) -> str:
    """
    Kicks off a background history sync.
    Returns a job_id that can be used to poll status.
    """
    job_id = str(uuid.uuid4())
    cache = CacheService(redis_client)

    await cache.set_job_status(job_id, {
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
        "progress": 0,
        "total": None,
        "message": "History sync started"
    })

    # Dispatch the sync in background (fire-and-forget)
    asyncio.create_task(_run_history_sync(job_id, redis_client))

    return job_id


async def _run_history_sync(job_id: str, redis_client):
    """Background worker: fetches all calls from CTM and caches them."""
    cache = CacheService(redis_client)
    settings_module = __import__("config")
    settings = settings_module.get_settings()

    try:
        # Fetch last 30 days of calls
        all_calls = []
        page = 1
        per_page = 100
        from_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")

        while True:
            params = {
                "page": page,
                "per_page": per_page,
                "from_date": from_date
            }
            response = await ctm.get(
                f"/accounts/{ctm.get_account_id()}/calls.json",
                params=params
            )
            calls = response.get("calls", [])
            if not calls:
                break
            all_calls.extend(calls)
            if len(calls) < per_page:
                break
            page += 1
            await asyncio.sleep(0.2)  # Rate limiting

        # Cache the full history
        history_key = "ctm:calls:history:all"
        await cache.set(history_key, {"calls": all_calls, "synced_at": datetime.utcnow().isoformat()}, 600)

        await cache.set_job_status(job_id, {
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "total_calls": len(all_calls),
            "message": f"Synced {len(all_calls)} calls"
        })
    except Exception as e:
        await cache.set_job_status(job_id, {
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.utcnow().isoformat()
        })
```

---

## Task 3: Pydantic Models

**Files:**
- Create: `app/models/agents.py`
- Create: `app/models/calls.py`

- [ ] **Step 1: Create agents.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/models/agents.py`:

```python
from pydantic import BaseModel
from typing import Optional


class Agent(BaseModel):
    id: str
    uid: Optional[int] = None
    name: str
    email: Optional[str] = None
    pic_url: Optional[str] = None


class AgentListResponse(BaseModel):
    agents: list[Agent]
    total: int


class UserGroup(BaseModel):
    id: str
    name: str
    agent_id: Optional[str] = None
```

- [ ] **Step 2: Create calls.py**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/models/calls.py`:

```python
from pydantic import BaseModel
from typing import Optional, Any


class Call(BaseModel):
    id: int
    sid: Optional[str] = None
    called_at: Optional[str] = None
    tracking_number: Optional[str] = None
    caller_number: Optional[str] = None
    status: Optional[str] = None
    direction: Optional[str] = None
    duration: Optional[int] = None
    talk_time: Optional[int] = None
    wait_time: Optional[int] = None
    source: Optional[str] = None
    agent: Optional[dict] = None  # {"Name": "...", "email": "...", "id": "..."}
    agent_id: Optional[str] = None


class CallListResponse(BaseModel):
    calls: list[dict]  # Full CTM call objects
    total: int
    page: Optional[int] = None
    per_page: Optional[int] = None
```

---

## Task 4: API Routers

**Files:**
- Create: `app/routers/agents.py`
- Create: `app/routers/calls.py`
- Create: `app/routers/active_calls.py`
- Create: `app/routers/live_calls.py`
- Create: `app/routers/sync.py`

- [ ] **Step 1: Create agents.py router**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/agents.py`:

```python
from fastapi import APIRouter, Request, HTTPException
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, with_cache, cache_key
from app.models.agents import AgentListResponse, UserGroup
from config import get_settings

router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


@router.get("/agents")
async def get_agents(request: Request):
    """Get all agents from CTM, cached for 5 minutes."""
    cache = get_cache(request)
    key = cache_key("agents:all")

    cached = await cache.get(key)
    if cached:
        return cached

    # Fetch all agents with pagination
    all_agents = []
    page = 1
    per_page = 100

    while True:
        params = {"page": page, "per_page": per_page}
        response = await ctm.get(
            f"/accounts/{ctm.get_account_id()}/agents.json",
            params=params
        )
        agents = response.get("agents", [])
        if not agents:
            break
        all_agents.extend(agents)
        if len(agents) < per_page:
            break
        page += 1

    result = {"data": {"agents": all_agents}, "cached_at": "now"}
    await cache.set(key, result, settings.cache_ttl_agents)
    return result


@router.get("/agents/groups")
async def get_agent_groups(request: Request):
    """Get agent groups from CTM, cached for 5 minutes."""
    cache = get_cache(request)
    key = cache_key("agents:groups")

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(f"/accounts/{ctm.get_account_id()}/user_groups.json")
    result = {"data": {"groups": response}}
    await cache.set(key, result, settings.cache_ttl_agents)
    return result
```

- [ ] **Step 2: Create calls.py router**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/calls.py`:

```python
from fastapi import APIRouter, Request, Query
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, cache_key
from config import get_settings

router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


@router.get("/calls")
async def get_calls(
    request: Request,
    status: str | None = None,
    direction: str | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    page: int = 1,
    per_page: int = 100,
):
    """Get calls with filters, cached for 2 minutes."""
    cache = get_cache(request)
    params = {"status": status, "direction": direction,
              "from_date": from_date, "to_date": to_date,
              "page": page, "per_page": per_page}
    params = {k: v for k, v in params.items() if v is not None}
    key = cache_key("calls:list", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(f"/accounts/{ctm.get_account_id()}/calls.json", params=params)
    result = {"data": response}
    await cache.set(key, result, settings.cache_ttl_calls)
    return result


@router.get("/calls/history")
async def get_calls_history(
    request: Request,
    from_date: str | None = None,
    to_date: str | None = None,
    per_page: int = 100,
):
    """Get all historical calls. If many, trigger background sync and return cached."""
    cache = get_cache(request)

    # Check if full history is already cached
    history_key = "ctm:calls:history:all"
    cached_history = await cache.get(history_key)
    if cached_history:
        calls = cached_history.get("calls", [])
        # Filter by date range if provided
        return {"data": {"calls": calls, "synced_at": cached_history.get("synced_at")}}

    # Lightweight history fetch
    params = {"per_page": per_page, "from_date": from_date, "to_date": to_date}
    params = {k: v for k, v in params.items() if v is not None}
    response = await ctm.get(f"/accounts/{ctm.get_account_id()}/calls.json", params=params)
    return {"data": response}


@router.get("/calls/search")
async def search_calls(
    request: Request,
    phone: str = Query(..., description="Phone number to search"),
    hours: int = 8760,
):
    """Search calls by phone number."""
    cache = get_cache(request)
    params = {"phone_number": phone, "hours": hours}
    key = cache_key("calls:search", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params={"phone_number": phone, "hours": hours}
    )
    result = {"data": {"calls": response.get("calls", response)}}
    await cache.set(key, result, settings.cache_ttl_calls)
    return result


@router.get("/calls/{call_id}")
async def get_call(request: Request, call_id: str):
    """Get a single call by ID."""
    response = await ctm.get(f"/accounts/{ctm.get_account_id()}/calls/{call_id}.json")
    return {"data": response}


@router.get("/calls/{call_id}/audio")
async def get_call_audio(request: Request, call_id: str):
    """Get call recording URL."""
    call = await ctm.get(f"/accounts/{ctm.get_account_id()}/calls/{call_id}.json")
    recording_url = call.get("recording_url") or call.get("recording")
    if not recording_url:
        raise HTTPException(status_code=404, detail="No recording available")
    return {"data": {"recording_url": recording_url}}


@router.get("/calls/{call_id}/transcript")
async def get_call_transcript(request: Request, call_id: str):
    """Get call transcript."""
    response = await ctm.get(f"/accounts/{ctm.get_account_id()}/calls/{call_id}/transcript")
    return {"data": {"transcript": response if isinstance(response, str) else response.get("transcript", "")}}
```

- [ ] **Step 3: Create active_calls.py router**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/active_calls.py`:

```python
from fastapi import APIRouter, Request
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, cache_key
from config import get_settings

router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


@router.get("/active-calls")
async def get_active_calls(request: Request, status: str = "in_progress", hours: int = 1):
    """Get active/in-progress calls, cached for 30 seconds (near real-time)."""
    cache = get_cache(request)
    params = {"status": status, "hours": hours}
    key = cache_key("calls:active", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params=params
    )
    calls = response.get("calls", response) if isinstance(response, dict) else response
    result = {"data": {"calls": calls}}
    await cache.set(key, result, settings.cache_ttl_active_calls)
    return result
```

- [ ] **Step 4: Create live_calls.py router**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/live_calls.py`:

```python
from fastapi import APIRouter, Request
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, cache_key
from config import get_settings

router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


@router.get("/live-calls")
async def get_live_calls(request: Request, status: str = "in_progress", hours: int = 1):
    """Get live calls with admin filtering, cached for 30 seconds."""
    cache = get_cache(request)
    params = {"status": status, "hours": hours}
    key = cache_key("calls:live", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params=params
    )
    calls = response.get("calls", response) if isinstance(response, dict) else response
    result = {"data": {"calls": calls}}
    await cache.set(key, result, settings.cache_ttl_active_calls)
    return result


@router.get("/monitor/active-calls")
async def get_monitor_active_calls(request: Request, status: str = "in_progress", hours: int = 1):
    """Get active calls for monitoring, cached for 30 seconds."""
    return await get_live_calls(request, status, hours)
```

- [ ] **Step 5: Create sync.py router**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/app/routers/sync.py`:

```python
from fastapi import APIRouter, Request, HTTPException
from app.services.sync_service import trigger_history_sync
from app.services.cache import CacheService

router = APIRouter()


@router.post("/trigger")
async def trigger_sync(request: Request):
    """Trigger a background history sync job. Returns job_id."""
    redis = request.app.state.redis
    job_id = await trigger_history_sync(redis)
    return {"job_id": job_id, "message": "History sync started"}


@router.get("/status/{job_id}")
async def get_sync_status(request: Request, job_id: str):
    """Get status of a background sync job."""
    cache = CacheService(request.app.state.redis)
    status = await cache.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status


@router.delete("/cache/{prefix}")
async def invalidate_cache(request: Request, prefix: str):
    """Invalidate cache for a specific prefix (e.g., agents, calls)."""
    cache = CacheService(request.app.state.redis)
    await cache.delete_prefix(prefix)
    return {"message": f"Cache invalidated for {prefix}"}
```

---

## Task 5: Laravel FastApiService

**Files:**
- Create: `app/Services/FastApiService.php`
- Modify: `app/Services/CTM/AgentProfileService.php` (remove CTMFacade usage)
- Modify: `.env`

- [ ] **Step 1: Create FastApiService**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Services/FastApiService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FastApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.fastapi.url', env('FASTAPI_URL', 'http://localhost:8000'));
    }

    /**
     * Make a GET request to FastAPI
     */
    public function get(string $endpoint, array $query = []): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/api/{$endpoint}", $query);
            if ($response->successful()) {
                return $response->json() ?? ['success' => true];
            }
            Log::error('FastAPI error: ' . $response->status() . ' - ' . $response->body());
            return ['error' => 'FastAPI request failed: ' . $response->status(), 'status' => $response->status()];
        } catch (\Exception $e) {
            Log::error('FastAPI exception: ' . $e->getMessage());
            return ['error' => 'FastAPI unavailable: ' . $e->getMessage()];
        }
    }

    /**
     * Trigger a background sync job
     */
    public function triggerSync(): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/api/sync/trigger");
            if ($response->successful()) {
                return $response->json();
            }
            return ['error' => 'Failed to trigger sync', 'status' => $response->status()];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get sync job status
     */
    public function getSyncStatus(string $jobId): array
    {
        try {
            $response = Http::timeout(10)->get("{$this->baseUrl}/api/sync/status/{$jobId}");
            if ($response->successful()) {
                return $response->json();
            }
            return ['error' => 'Job not found', 'status' => $response->status()];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Invalidate cache for a prefix
     */
    public function invalidateCache(string $prefix): array
    {
        try {
            $response = Http::timeout(10)->delete("{$this->baseUrl}/api/sync/cache/{$prefix}");
            return $response->successful() ? ['success' => true] : ['error' => 'Failed'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
```

- [ ] **Step 2: Add FastAPI config**

Modify `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/config/services.php` — add:

```php
'fastapi' => [
    'url' => env('FASTAPI_URL', 'http://localhost:8000'),
],
```

- [ ] **Step 3: Add FastAPI .env vars**

Modify `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/.env` — append:

```
FASTAPI_URL=http://localhost:8000
```

---

## Task 6: Create Laravel Queue Jobs

**Files:**
- Create: `app/Jobs/CtmPeriodicSync.php`
- Create: `app/Console/Commands/CtmPeriodicSyncCommand.php`

- [ ] **Step 1: Create CtmPeriodicSync job**

Create directory and file:

```bash
mkdir -p /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Jobs
```

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Jobs/CtmPeriodicSync.php`:

```php
<?php

namespace App\Jobs;

use App\Services\FastApiService;
use App\Models\AgentProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CtmPeriodicSync implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function handle(FastApiService $fastApi): void
    {
        Log::info('[CtmPeriodicSync] Starting periodic sync...');

        // 1. Trigger FastAPI to refresh CTM cache
        $triggerResult = $fastApi->triggerSync();
        Log::info('[CtmPeriodicSync] Trigger result: ' . json_encode($triggerResult));

        if (isset($triggerResult['job_id'])) {
            $jobId = $triggerResult['job_id'];
            // Poll for completion (up to 5 minutes)
            $maxWait = 300;
            $waited = 0;
            while ($waited < $maxWait) {
                sleep(10);
                $waited += 10;
                $status = $fastApi->getSyncStatus($jobId);
                $jobStatus = $status['status'] ?? null;
                Log::info("[CtmPeriodicSync] Job status: {$jobStatus}");
                if ($jobStatus === 'completed' || $jobStatus === 'failed') {
                    break;
                }
            }
        }

        // 2. Invalidate agents cache so next request fetches fresh
        $fastApi->invalidateCache('agents');

        // 3. Sync agent profiles from CTM (update existing, don't create new)
        $this->syncAgentProfiles();

        Log::info('[CtmPeriodicSync] Periodic sync complete.');
    }

    protected function syncAgentProfiles(): void
    {
        $fastApi = new FastApiService();
        $response = $fastApi->get('ctm/agents');

        $agents = $response['data']['agents'] ?? $response['agents'] ?? [];
        $expectedNames = AgentProfile::pluck('name')->toArray();
        $synced = 0;

        foreach ($agents as $agent) {
            $name = $agent['name'] ?? null;
            if (!$name) continue;

            $existing = AgentProfile::where('name', $name)->first();
            if ($existing) {
                $existing->update([
                    'ctm_agent_id' => $agent['id'] ?? null,
                    'email' => $agent['email'] ?? null,
                    'team' => $agent['group'] ?? null,
                ]);
                $synced++;
            }
        }

        Log::info("[CtmPeriodicSync] Synced {$synced} agent profiles.");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[CtmPeriodicSync] Failed: ' . $exception->getMessage());
    }
}
```

- [ ] **Step 2: Create scheduler command**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Console/Commands/CtmPeriodicSyncCommand.php`:

```php
<?php

namespace App\Console\Commands;

use App\Jobs\CtmPeriodicSync;
use Illuminate\Console\Command;

class CtmPeriodicSyncCommand extends Command
{
    protected $signature = 'ctm:periodic-sync {--sync : Run synchronously instead of queuing}';
    protected $description = 'Trigger periodic CTM sync (agents + calls cache refresh)';

    public function handle(): int
    {
        if ($this->option('sync')) {
            $this->info('Running sync synchronously...');
            $job = new CtmPeriodicSync();
            $job->handle(app(\App\Services\FastApiService::class));
            $this->info('Done.');
        } else {
            CtmPeriodicSync::dispatch();
            $this->info('Periodic sync job dispatched to queue.');
        }
        return Command::SUCCESS;
    }
}
```

- [ ] **Step 3: Register scheduler**

Modify `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/routes/console.php` or add to `app/Console/Kernel.php` schedule:

```php
// In Console/Kernel.php schedule():
$schedule->command('ctm:periodic-sync --sync')->everyFiveMinutes();
```

Or in `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;
Schedule::command('ctm:periodic-sync --sync')->everyFiveMinutes();
```

---

## Task 7: Update Livewire Components to Use FastApiService

**Files:**
- Modify: `app/Livewire/Dashboard/AgentsIndex.php`
- Modify: `app/Livewire/Dashboard/HistoryIndex.php`
- Modify: `app/Livewire/Dashboard/MonitorIndex.php`

- [ ] **Step 1: Update AgentsIndex to use FastApiService**

Replace `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Livewire/Dashboard/AgentsIndex.php` with:

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class AgentsIndex extends Component
{
    public Collection $agents;
    public ?string $error = null;

    protected FastApiService $fastApi;
    protected AgentProfileService $agentProfileService;

    public function boot(FastApiService $fastApi, AgentProfileService $agentProfileService)
    {
        $this->fastApi = $fastApi;
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
            // Fetch from FastAPI (which has Redis cache + CTM)
            $response = $this->fastApi->get('ctm/agents');
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $agents = $response['data']['agents'] ?? $response['agents'] ?? [];
            // Filter to AgentProfile names
            $agents = $this->agentProfileService->filterCallsByProfile($agents);
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

- [ ] **Step 2: Update HistoryIndex to use FastApiService**

Replace `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Livewire/Dashboard/HistoryIndex.php` with:

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
use App\Services\CTM\AgentProfileService;
use Livewire\Component;
use Illuminate\Support\Collection;

class HistoryIndex extends Component
{
    public Collection $calls;
    public ?string $error = null;
    public array $filters = [
        'date_from' => '',
        'date_to' => '',
    ];

    protected FastApiService $fastApi;
    protected AgentProfileService $agentProfileService;

    public function boot(FastApiService $fastApi, AgentProfileService $agentProfileService)
    {
        $this->fastApi = $fastApi;
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

            $response = $this->fastApi->get('ctm/calls/history', $params);
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $calls = $response['data']['calls'] ?? $response['calls'] ?? [];
            // Filter to AgentProfile agents
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

- [ ] **Step 3: Update MonitorIndex to use FastApiService**

Replace `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/app/Livewire/Dashboard/MonitorIndex.php` with:

```php
<?php

namespace App\Livewire\Dashboard;

use App\Services\FastApiService;
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
    public Collection $groups;

    public array $liveState = [
        'transcript' => [],
        'callerName' => null,
        'callerPhone' => null,
    ];

    protected FastApiService $fastApi;
    protected AgentProfileService $agentProfileService;

    public function boot(FastApiService $fastApi, AgentProfileService $agentProfileService)
    {
        $this->fastApi = $fastApi;
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
            $response = $this->fastApi->get('ctm/active-calls', ['status' => 'in_progress']);
            if (isset($response['error'])) {
                $this->error = $response['error'];
                return;
            }

            $calls = $response['data']['calls'] ?? $response['calls'] ?? [];
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

    public function startMonitoring() { $this->isMonitoring = true; }
    public function stopMonitoring() { $this->isMonitoring = false; }

    public function render()
    {
        return view('livewire.dashboard.monitor-index');
    }
}
```

---

## Task 8: Update API Routes — Laravel Now Uses FastAPI

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Update routes/api.php**

The CTM controllers in Laravel are no longer needed for direct CTM calls — Laravel now proxies through FastApiService. But keep the controllers for API compatibility:

Replace `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/routes/api.php` with:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CTM\AgentProfilesController;
use App\Http\Controllers\Api\AuthController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/session', [AuthController::class, 'session'])->middleware('auth:sanctum');
});

// Agent Profiles CRUD (still handled by Laravel, stored in SQLite)
Route::prefix('agent-profiles')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AgentProfilesController::class, 'index']);
    Route::post('/', [AgentProfilesController::class, 'store']);
    Route::get('/{id}', [AgentProfilesController::class, 'show']);
    Route::put('/{id}', [AgentProfilesController::class, 'update']);
    Route::delete('/{id}', [AgentProfilesController::class, 'destroy']);
    Route::post('/sync', [AgentProfilesController::class, 'sync']);
});

// NOTE: All /ctm/* routes are now handled by FastAPI at http://localhost:8000
// Laravel Livewire components call FastApiService which proxies to FastAPI
```

---

## Task 9: FastAPI .env and Startup Script

**Files:**
- Create: `bob-ags-fastapi/.env`
- Create: `bob-ags-fastapi/run.sh`

- [ ] **Step 1: Create .env**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/.env`:

```
CTM_ACCESS_KEY=a341882d847fd790082ce05f378824a3e321f669
CTM_SECRET_KEY=74db3c6ae35b0afd9e1d9a02cf358671e1fe
CTM_ACCOUNT_ID=341882

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

HOST=0.0.0.0
PORT=8000
```

- [ ] **Step 2: Create run.sh**

Create `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi/run.sh`:

```bash
#!/bin/bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi
source .env
pip install -r requirements.txt -q
uvicorn main:app --host $HOST --port $PORT --reload
```

---

## Task 10: Laravel Queue Worker Setup

**Files:**
- Modify: `.env`

- [ ] **Step 1: Update .env for Redis queue**

Change in `/Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel/.env`:

```
QUEUE_CONNECTION=redis
```

- [ ] **Step 2: Install predis if needed**

```bash
composer require predis/predis
```

- [ ] **Step 3: Start queue worker**

```bash
php artisan queue:work redis --sleep=3 --tries=3
```

Or with Laravel Horizon (if installed):

```bash
php artisan horizon
```

---

## Task 11: Integration Verification

- [ ] **Step 1: Start FastAPI**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status":"ok"}`

- [ ] **Step 2: Test FastAPI CTM endpoints**

```bash
curl "http://localhost:8000/api/ctm/agents" | jq '.data.agents | length'
# Should return number of CTM agents
```

- [ ] **Step 3: Test Laravel → FastAPI**

```bash
curl "http://localhost:8888/api/ctm/agents"
# Should proxy through FastApiService → FastAPI → CTM (cached)
```

- [ ] **Step 4: Test queue job**

```bash
cd /Users/archerterminez/Desktop/REPOSITORY/bob-ags-laravel
php artisan ctm:periodic-sync --sync
# Should trigger FastAPI cache refresh and sync agent profiles
```

---

## Self-Review Checklist

- [ ] FastAPI starts on port 8000 and connects to CTM API
- [ ] Redis caching works (agents: 5min, calls: 2min, active-calls: 30sec)
- [ ] Laravel FastApiService correctly proxies all CTM calls through FastAPI
- [ ] AgentProfile filtering still works (17 Phillies agents only)
- [ ] Queue job `ctm:periodic-sync` runs every 5 minutes
- [ ] Background history sync job works via `/api/sync/trigger`
- [ ] Only 17 agents shown in Agents dashboard (not all CTM agents)

---

## Dependencies

- Task 1 must complete before Tasks 2-4 (scaffolding needed)
- Task 2 must complete before Tasks 3-4 (CTM client needed)
- Task 5 must complete before Task 7 (FastApiService needed)
- Task 7 must complete before Task 8 (Livewire components updated)
- Task 11 is the final verification step
