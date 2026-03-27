from fastapi import APIRouter, Request, Query, HTTPException
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
    params = {
        "status": status,
        "direction": direction,
        "from_date": from_date,
        "to_date": to_date,
        "page": page,
        "per_page": per_page,
    }
    params = {k: v for k, v in params.items() if v is not None}
    key = cache_key("calls:list", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params=params
    )
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
    """Get historical calls. Returns cached full history if available."""
    cache = get_cache(request)

    # Check if full history is already cached
    history_key = "ctm:calls:history:all"
    cached_history = await cache.get(history_key)
    if cached_history:
        calls = cached_history.get("calls", [])
        return {"data": {"calls": calls, "synced_at": cached_history.get("synced_at")}}

    # Lightweight history fetch
    params = {"per_page": per_page}
    if from_date:
        params["from_date"] = from_date
    if to_date:
        params["to_date"] = to_date
    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params=params
    )
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
    calls = response.get("calls", response) if isinstance(response, dict) else response
    result = {"data": {"calls": calls}}
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