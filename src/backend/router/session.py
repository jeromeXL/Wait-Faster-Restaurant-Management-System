from fastapi import APIRouter
from models.session import OrderStatus, SessionStatus, OrderItem, Order, Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter()

# OrderItem Response + DTO
# Order Response + DTO
# Session Response + DTO
# TableActivity Response + DTO
# -> ActivityPanelResponse


class OrderItemResponse(BaseModel):
    # feel like we'd need the str so we can change orderItem statuses
    id: str
    # is it better to have status as an int cause it's a response?
    status: int
    menu_item_id: str
    isFree: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]

class OrderResponse(BaseModel):
    id: str
    status: int
    session_id: str
    items: List[OrderItemResponse]

class SessionResponse(BaseModel):
    status: SessionStatus
    orders: Optional[List[OrderResponse]]
    session_start_time: datetime
    session_end_time: Optional[datetime]


@router.post("/session/start")
async def start_session() -> Session:
    now = datetime.now()
    new_session = Session(status=SessionStatus.OPEN, orders=None, session_start_time=now, session_end_time=None)
    await new_session.create()
    return new_session