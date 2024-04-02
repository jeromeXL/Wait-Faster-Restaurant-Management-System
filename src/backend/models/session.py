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


class OrderItem(Document):
    status: OrderStatus
    menu_item_id: str
    is_free: bool
    preferences: Optional[List[str]] = Field(default=None)
    additional_notes: Optional[str] = Field(default=None)


class Order(Document):
    status: OrderStatus
    session_id: str
    items: List[OrderItem]


class Session(Document):
    status: SessionStatus
    orders: Optional[List[str]] = Field(default=None)
    session_start_time: datetime
    session_end_time: Optional[datetime] = Field(default=None)
