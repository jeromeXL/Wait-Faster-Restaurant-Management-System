from beanie import Document, PydanticObjectId
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import Field
from models.order import OrderStatus


class SessionStatus(Enum):
    OPEN = 0
    AWAITING_PAYMENT = 1
    CLOSED = 2


class Session(Document):
    status: SessionStatus
    orders: Optional[List[str]] = Field(default=[])
    session_start_time: datetime
    session_end_time: Optional[datetime] = Field(default=None)
