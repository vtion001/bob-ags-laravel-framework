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
    """Get live calls, cached for 30 seconds."""
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