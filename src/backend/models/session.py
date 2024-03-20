from beanie import Document, PydanticObjectId
from datetime import datetime
from typing import List, Optional
from enum import Enum

class OrderStatus(Enum):
    ORDERED = 0
    PREPARING = 1
    COMPLETE = 2

class SessionStatus(Enum):
    OPEN = 0
    AWAITING_PAYMENT: 1
    CLOSED = 2

class OrderItem(Document):
    status: OrderStatus
    menu_item_id: str
    isFree: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]

class Order(Document):
    status: OrderStatus
    session_id: str
    items: List[str]

class Session(Document):
    status: SessionStatus
    orders: Optional[List[str]]
    session_start_time: datetime
    session_end_time: Optional[datetime]