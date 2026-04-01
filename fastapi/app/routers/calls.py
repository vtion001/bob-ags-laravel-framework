from fastapi import APIRouter, Request, Query, HTTPException
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService, cache_key
from config import get_settings
from datetime import datetime

router = APIRouter()
settings = get_settings()
ctm = CTMClient()


def get_cache(request: Request) -> CacheService:
    return CacheService(request.app.state.redis)


def date_to_unix(date_str: str | None, end_of_day: bool = False) -> int | None:
    """Convert date string to Unix timestamp. If end_of_day=True, returns 23:59:59 timestamp."""
    if not date_str:
        return None
    try:
        ts = int(datetime.fromisoformat(date_str.replace("Z", "+00:00")).timestamp())
        if end_of_day:
            # Get end of that day
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(hour=23, minute=59, second=59)
            ts = int(dt.timestamp())
        return ts
    except (ValueError, TypeError):
        try:
            ts = int(datetime.strptime(date_str, "%Y-%m-%d").timestamp())
            if end_of_day:
                dt = datetime.strptime(date_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
                ts = int(dt.timestamp())
            return ts
        except (ValueError, TypeError):
            return None


def extract_cursor(next_page: str | None) -> str | None:
    """Extract 'after' cursor from CTM next_page URL."""
    if not next_page:
        return None
    try:
        from urllib.parse import parse_qs, urlparse
        query = parse_qs(urlparse(next_page).query)
        cursors = query.get("after", [])
        return cursors[0] if cursors else None
    except Exception:
        return None


@router.get("/calls")
async def get_calls(
    request: Request,
    status: str | None = None,
    direction: str | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    per_page: int = 100,
    after: str | None = None,
):
    """Get calls with filters, cached for 2 minutes."""
    cache = get_cache(request)
    params = {
        "status": status,
        "direction": direction,
        "start_date": date_to_unix(from_date),
        "end_date": date_to_unix(to_date, end_of_day=True),
        "per_page": per_page,
        "after": after,
    }
    # Remove None values
    params = {k: v for k, v in params.items() if v is not None}
    key = cache_key("calls:list", params)

    cached = await cache.get(key)
    if cached:
        return cached

    response = await ctm.get(
        f"/accounts/{ctm.get_account_id()}/calls.json",
        params=params
    )
    result = {"data": response.get("calls", response), "next_cursor": extract_cursor(response.get("next_page"))}
    await cache.set(key, result, settings.cache_ttl_calls)
    return result


@router.get("/calls/history")
async def get_calls_history(
    request: Request,
    from_date: str | None = None,
    to_date: str | None = None,
    per_page: int = 100,
):
    """Get all historical calls using cursor-based pagination."""
    cache = get_cache(request)

    # Check if full history is already cached
    history_key = "ctm:calls:history:all"
    cached_history = await cache.get(history_key)
    if cached_history:
        return {"data": {"calls": cached_history.get("calls", []), "synced_at": cached_history.get("synced_at")}}

    all_calls = []
    cursor = None
    page_count = 0
    max_pages = 500

    while page_count < max_pages:
        params = {
            "per_page": per_page,
            "start_date": date_to_unix(from_date),
            "end_date": date_to_unix(to_date, end_of_day=True),
        }
        if cursor:
            params["after"] = cursor

        params = {k: v for k, v in params.items() if v is not None}

        response = await ctm.get(
            f"/accounts/{ctm.get_account_id()}/calls.json",
            params=params
        )

        calls = response.get("calls", [])
        if not calls:
            break

        all_calls.extend(calls)
        page_count += 1

        cursor = extract_cursor(response.get("next_page"))
        if not cursor:
            break

    return {"data": {"calls": all_calls, "total_pages": page_count}}


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
