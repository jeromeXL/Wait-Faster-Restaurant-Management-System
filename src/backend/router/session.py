from fastapi import APIRouter
from models.session import OrderStatus, SessionStatus, OrderItem, Order, Session
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

@router.post("/session/start")
async def start_session() -> Session:
    new_session = Session(status=SessionStatus.OPEN, orders=None, session_start_time=datetime.now(), session_end_time=None)
    await new_session.create()
    return new_session