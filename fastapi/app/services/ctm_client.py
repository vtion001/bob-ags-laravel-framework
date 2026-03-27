import httpx
import base64
from config import get_settings

settings = get_settings()


class CTMClient:
    """Makes authenticated requests to CTM API — replicates Laravel's CTM\Client"""

    def __init__(self):
        self.base_url = settings.ctm_base_url
        self.access_key = settings.ctm_access_key
        self.secret_key = settings.ctm_secret_key
        self.account_id = settings.ctm_account_id

    def _get_auth_header(self) -> str:
        return base64.b64encode(
            f"{self.access_key}:{self.secret_key}".encode()
        ).decode()

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Basic {self._get_auth_header()}",
            "Content-Type": "application/json",
        }

    async def get(self, endpoint: str, params: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def post(self, endpoint: str, data: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()

    def get_account_id(self) -> str:
        return self.account_id