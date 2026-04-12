import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import agents, calls, active_calls, live_calls, sync
import redis.asyncio as redis
from config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="bob-ags-fastapi",
    description="CTM API proxy with Redis caching and background jobs",
    version="1.0.0"
)

# CORS - restrict to Laravel app origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://app:80",
        "http://localhost:80",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Redis client on app state
@app.on_event("startup")
async def startup():
    # Validate required configuration
    if not settings.ctm_access_key or not settings.ctm_secret_key or not settings.ctm_account_id:
        logger.error("CTM credentials are not configured. Set CTM_ACCESS_KEY, CTM_SECRET_KEY, CTM_ACCOUNT_ID.")

    r = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        password=settings.redis_password or None,
        db=settings.redis_db,
        decode_responses=True,
    )
    try:
        await r.ping()
        logger.info("Redis connection established.")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}. Cache will be unavailable.")
    app.state.redis = r


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
