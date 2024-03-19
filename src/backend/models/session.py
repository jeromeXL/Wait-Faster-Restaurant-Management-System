from beanie import Document
from time import time
from typing import List, Optional
from pydantic import ObjectId
from enum import Enum
from menuItem import MenuItem

class Status(Enum):
    OPEN = 0
    PENDING = 1
    CLOSED = 2

class Order(Document):
    status: Status
    session_id: ObjectId
    items: List[ObjectId]

class OrderItem(Document):
    menu_item_id: ObjectId
    isFree: bool
    status: Status
    notes: str
    preferences: List[str]

class Session(Document):
    status: Status
    orders: List[ObjectId]
    session_start_time: time
    session_end_time: Optional[time]