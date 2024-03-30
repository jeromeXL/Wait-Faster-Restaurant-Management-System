from fastapi import APIRouter, HTTPException, Depends, status, Security
from models.session import OrderStatus, SessionStatus, OrderItem, Order, Session
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models.user import User, UserRole
from utils.user_authentication import current_user, customer_tablet_user
from fastapi.security import OAuth2PasswordBearer
from jwt import user_from_token
from fastapi_jwt import JwtAuthorizationCredentials

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
async def lock_session(session_id: str) -> Session:
    session = await Session.get(session_id)
    session.status = SessionStatus.AWAITING_PAYMENT
    await session.save()
    return session

'''
@router.post("/session/complete")
async def complete_session(session_id: str) -> Session:
    session = await Session.get(session_id)
    session.status = SessionStatus.CLOSED
    await session.save()
    return session
'''

@router.get("/table/session/{userId}")
async def get_table_session(userId: str) -> SessionResponse:
    user = await User.get(userId)

    if user.role != UserRole.CUSTOMER_TABLET:
        raise HTTPException(status_code=403, detail="403 Forbidden: Only Customer Tables have sessions")

    session_id = user.active_session
    session = await Session.get(session_id)

    session_response = SessionResponse(id=str(session.id), status=session.status, orders=session.orders, session_start_time=session.session_start_time, session_end_time=session.session_end_time)
    return session_response
