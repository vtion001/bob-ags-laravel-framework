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

    try:
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
    except Exception as e:
        logger.error(f"CTM agents fetch failed: {e}")
        raise HTTPException(status_code=503, detail="CTM service unavailable")

    result = {"data": {"agents": all_agents}}
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

    try:
        response = await ctm.get(f"/accounts/{ctm.get_account_id()}/user_groups.json")
    except Exception as e:
        logger.error(f"CTM groups fetch failed: {e}")
        raise HTTPException(status_code=503, detail="CTM service unavailable")

    result = {"data": {"groups": response}}
    await cache.set(key, result, settings.cache_ttl_agents)
    return result