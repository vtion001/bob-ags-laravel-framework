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