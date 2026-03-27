from pydantic import BaseModel
from typing import Optional


class Agent(BaseModel):
    id: str
    uid: Optional[int] = None
    name: str
    email: Optional[str] = None
    pic_url: Optional[str] = None


class UserGroup(BaseModel):
    id: str
    name: str
    agent_id: Optional[str] = None
