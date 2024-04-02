from uuid import UUID
from beanie import Document, PydanticObjectId
from typing import List, Optional
from enum import Enum

from pydantic import BaseModel


class OrderStatus(int, Enum):
    ORDERED = 0
    PREPARING = 1
    COMPLETE = 2
    DELIVERING = 3
    DELIVERED = 4


class OrderItem(BaseModel):
    id: PydanticObjectId
    status: OrderStatus
    menu_item_id: PydanticObjectId
    is_free: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]


class Order(Document):
    status: OrderStatus
    session_id: PydanticObjectId
    items: List[OrderItem]


valid_transitions = {
    OrderStatus.ORDERED: [OrderStatus.PREPARING],
    OrderStatus.PREPARING: [OrderStatus.COMPLETE],
    OrderStatus.COMPLETE: [OrderStatus.DELIVERING, OrderStatus.PREPARING],
    OrderStatus.DELIVERING: [OrderStatus.COMPLETE, OrderStatus.DELIVERED],
}
