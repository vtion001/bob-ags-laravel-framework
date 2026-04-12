import uuid
import asyncio
import logging
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse
from app.services.ctm_client import CTMClient
from app.services.cache import CacheService

logger = logging.getLogger(__name__)
ctm = CTMClient()


def _extract_cursor(next_page: str | None) -> str | None:
    """Extract 'after' cursor from CTM next_page URL."""
    if not next_page:
        return None
    try:
        query = parse_qs(urlparse(next_page).query)
        cursors = query.get("after", [])
        return cursors[0] if cursors else None
    except Exception:
        return None


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

    task = asyncio.create_task(_run_history_sync(job_id, redis_client))
    # Attach a done-callback so unhandled exceptions are logged
    task.add_done_callback(lambda t: _log_task_error(t, job_id))

    return job_id


def _log_task_error(task: asyncio.Task, job_id: str) -> None:
    if task.cancelled():
        logger.warning(f"[sync] Job {job_id} was cancelled")
    elif task.exception():
        logger.error(f"[sync] Job {job_id} raised unhandled exception: {task.exception()}")


async def _run_history_sync(job_id: str, redis_client) -> None:
    """Background worker: fetches calls from CTM using cursor pagination and caches them."""
    cache = CacheService(redis_client)

    try:
        all_calls = []
        per_page = 100
        cursor = None
        page_count = 0
        max_pages = 500
        from_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        from_ts = int(datetime.strptime(from_date, "%Y-%m-%d").timestamp())

        while page_count < max_pages:
            params: dict = {"per_page": per_page, "start_date": from_ts}
            if cursor:
                params["after"] = cursor

            try:
                response = await ctm.get(
                    f"/accounts/{ctm.get_account_id()}/calls.json",
                    params=params
                )
            except Exception as e:
                logger.error(f"[sync] CTM API error on page {page_count + 1}: {e}")
                break

            calls = response.get("calls", [])
            if not calls:
                break

            all_calls.extend(calls)
            page_count += 1
            logger.info(f"[sync] Job {job_id}: fetched {len(all_calls)} calls so far (page {page_count})")

            cursor = _extract_cursor(response.get("next_page"))
            if not cursor:
                break

            await asyncio.sleep(0.2)  # Respect CTM rate limit

        history_key = "ctm:calls:history:all"
        await cache.set(history_key, {
            "calls": all_calls,
            "synced_at": datetime.utcnow().isoformat(),
        }, 600)

        await cache.set_job_status(job_id, {
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "total_calls": len(all_calls),
            "message": f"Synced {len(all_calls)} calls",
        })
        logger.info(f"[sync] Job {job_id} completed: {len(all_calls)} calls")

    except Exception as e:
        logger.error(f"[sync] Job {job_id} failed: {e}")
        await cache.set_job_status(job_id, {
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.utcnow().isoformat(),
        })
