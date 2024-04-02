from beanie import Document, PydanticObjectId
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class OrderStatus(int, Enum):
    ORDERED = 0
    PREPARING = 1
    COMPLETE = 2
    DELIVERING = 3
    DELIVERED = 4


class OrderItem(Document):
    status: OrderStatus
    menu_item_id: str
    is_free: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]


class Order(Document):
    status: OrderStatus
    session_id: str
    items: List[OrderItem]


def serialize_order_status(order_status):
    return order_status.value


valid_transitions = {
    OrderStatus.ORDERED: [OrderStatus.PREPARING],
    OrderStatus.PREPARING: [OrderStatus.COMPLETE],
    OrderStatus.COMPLETE: [OrderStatus.DELIVERING, OrderStatus.PREPARING],
    OrderStatus.DELIVERING: [OrderStatus.COMPLETE, OrderStatus.DELIVERED],
}
