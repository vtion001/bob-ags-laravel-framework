import json
import hashlib
from config import get_settings

settings = get_settings()


def cache_key(prefix: str, params: dict | None = None) -> str:
    """Generate a cache key from prefix and params dict."""
    if params:
        param_str = json.dumps(params, sort_keys=True)
        hash_suffix = hashlib.md5(param_str.encode()).hexdigest()[:8]
        return f"ctm:{prefix}:{hash_suffix}"
    return f"ctm:{prefix}"


class CacheService:
    """Redis caching for CTM responses."""

    def __init__(self, redis_client):
        self.redis = redis_client

    async def get(self, key: str) -> dict | None:
        """Get cached value, returns None if not found."""
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return None

    async def set(self, key: str, value: dict, ttl: int) -> None:
        """Set cached value with TTL in seconds."""
        await self.redis.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    async def delete_prefix(self, prefix: str) -> None:
        """Delete all keys matching prefix (e.g., ctm:agents:*)."""
        pattern = f"ctm:{prefix}:*"
        async for key in self.redis.scan_iter(match=pattern):
            await self.redis.delete(key)

    async def set_job_status(self, job_id: str, status: dict) -> None:
        """Store job status for background job tracking (1hr TTL)."""
        await self.redis.setex(f"job:{job_id}", 3600, json.dumps(status))

    async def get_job_status(self, job_id: str) -> dict | None:
        data = await self.redis.get(f"job:{job_id}")
        if data:
            return json.loads(data)
        return None