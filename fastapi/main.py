from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import agents, calls, active_calls, live_calls, sync
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
