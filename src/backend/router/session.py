from fastapi import APIRouter, HTTPException, Depends, status, Security
from models.session import OrderStatus, SessionStatus, OrderItem, Order, Session
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models.user import User, UserRole
from utils.user_authentication import current_user, customer_tablet_user, wait_staff_user
from fastapi.security import OAuth2PasswordBearer
from jwt import user_from_token
from fastapi_jwt import JwtAuthorizationCredentials
from bson import ObjectId


router = APIRouter()

# OrderItem Response + DTO
# Order Response + DTO
# Session Response + DTO
# TableActivity Response + DTO
# -> ActivityPanelResponse


class OrderItemResponse(BaseModel):
    id: str
    status: OrderStatus
    menu_item_id: str
    isFree: bool
    preferences: Optional[List[str]] =  Field(default=None)
    additional_notes: Optional[str] =  Field(default=None)

class OrderResponse(BaseModel):
    id: str
    status: OrderStatus
    session_id: str
    items: List[OrderItemResponse]

class SessionResponse(BaseModel):
    id:  str
    status: SessionStatus
    orders: Optional[List[OrderResponse]] =  Field(default=None)
    session_start_time: datetime
    session_end_time: Optional[datetime] =  Field(default=None)


@router.post("/session/start")
async def start_session(customer_table: User = Depends(customer_tablet_user)) -> SessionResponse:

    if customer_table.active_session is not None:
        raise HTTPException(status_code=409, detail="409: Active session already exists for this user")

    new_session = Session(status=SessionStatus.OPEN, session_start_time=datetime.now())
    await new_session.create()

    customer_table.active_session = str(new_session.id)
    await customer_table.save()

    session_response  = SessionResponse(
        id=str(new_session.id), 
        status=new_session.status, 
        session_start_time=new_session.session_start_time
    )
    return session_response

@router.post("/session/lock")
async def lock_session(customer_table: User = Depends(customer_tablet_user)) -> SessionResponse:
    session = await Session.get(customer_table.active_session)
    session.status = SessionStatus.AWAITING_PAYMENT.value
    await session.save()

    session_response = SessionResponse(
        id=str(session.id),
        status=session.status,
        orders=session.orders,
        session_start_time=session.session_start_time,
        session_end_time=session.session_end_time
    )
    return session_response


@router.post("/session/complete/{customer_table_id}")
async def complete_session(customer_table_id: str, waiter: User = Depends(wait_staff_user)) -> SessionResponse:

    customer_table = User.get(customer_table_id)
    session = await Session.get(customer_table.active_session)
    session.status = SessionStatus.CLOSED.value
    await session.save()

    session_response = SessionResponse(
        id=str(session.id), 
        status=session.status, 
        orders=session.orders, 
        session_start_time=session.session_start_time, 
        session_end_time=session.session_end_time
    )
    return session_response


@router.get("/table/session")
async def get_table_session(customer_table: User = Depends(customer_tablet_user)) -> SessionResponse:
    session = await Session.get(customer_table.active_session)

    session_response = SessionResponse(
        id=str(session.id), 
        status=session.status, 
        orders=session.orders, 
        session_start_time=session.session_start_time, 
        session_end_time=session.session_end_time
    )
    return session_response
