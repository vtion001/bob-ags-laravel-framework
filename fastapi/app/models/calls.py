from pydantic import BaseModel
from typing import Optional, Any


class Call(BaseModel):
    id: int
    sid: Optional[str] = None
    called_at: Optional[str] = None
    tracking_number: Optional[str] = None
    caller_number: Optional[str] = None
    status: Optional[str] = None
    direction: Optional[str] = None
    duration: Optional[int] = None
    talk_time: Optional[int] = None
    wait_time: Optional[int] = None
    source: Optional[str] = None
    agent: Optional[dict] = None
    agent_id: Optional[str] = None
