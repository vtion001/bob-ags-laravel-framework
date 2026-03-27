from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # CTM credentials
    ctm_access_key: str = ""
    ctm_secret_key: str = ""
    ctm_account_id: str = ""
    ctm_base_url: str = "https://api.calltrackingmetrics.com/api/v1"

    # Redis
    redis_host: str = "127.0.0.1"
    redis_port: int = 6379
    redis_password: str = ""
    redis_db: int = 0

    # Cache TTLs (seconds)
    cache_ttl_agents: int = 300       # 5 minutes
    cache_ttl_calls: int = 120        # 2 minutes
    cache_ttl_active_calls: int = 30   # 30 seconds

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
