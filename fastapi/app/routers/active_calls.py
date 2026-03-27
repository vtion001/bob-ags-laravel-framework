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
    """Get active/in-progress calls, cached for 30 seconds."""
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