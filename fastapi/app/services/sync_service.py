import uuid
import asyncio
from datetime import datetime, timedelta
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService

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