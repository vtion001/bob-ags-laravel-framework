import logging
from fastapi import APIRouter, Request, HTTPException
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, cache_key
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


@router.get("/active-calls")
async def get_active_calls(request: Request, status: str = "in_progress", hours: int = 1):
    """Get active/in-progress calls, cached for 30 seconds."""
    cache = get_cache(request)
    params = {"status": status, "hours": hours}
    key = cache_key("calls:active", params)

    cached = await cache.get(key)
    if cached:
        return cached

    try:
        response = await ctm.get(
            f"/accounts/{ctm.get_account_id()}/calls.json",
            params=params
        )
    except Exception as e:
        logger.error(f"CTM active calls fetch failed: {e}")
        raise HTTPException(status_code=503, detail="CTM service unavailable")

    calls = response.get("calls", response) if isinstance(response, dict) else response
    result = {"data": {"calls": calls}}
    await cache.set(key, result, settings.cache_ttl_active_calls)
    return result
