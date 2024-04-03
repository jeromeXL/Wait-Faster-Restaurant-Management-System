from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from models.menuItem import MenuItem
from models.order import Order
from router.orders import OrderItemResponse, OrderResponse
from models.session import SessionStatus, Session
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models.user import User
from utils.user_authentication import (
    customer_tablet_user,
    manager_or_waitstaff_user,
)
from beanie.operators import In

router = APIRouter()


class SessionResponse(BaseModel):
    id: str
    status: SessionStatus
    orders: Optional[List[OrderResponse]] = Field(default=None)
    session_start_time: str
    session_end_time: Optional[str] = Field(default=None)


async def generate_session_response(session: Session) -> SessionResponse:
    orders = await Order.find(Order.session_id == session.id).to_list()
    menu_items = {
        item.id: item
        for item in await MenuItem.find(
            In(
                MenuItem.id,
                [item.menu_item_id for order in orders for item in order.items],
            )
        ).to_list()
    }

    return SessionResponse(
        **session.model_dump(exclude={"id", "orders"}),
        id=str(session.id),
        orders=[
            OrderResponse(
                **order.model_dump(exclude={"id", "items"}),
                id=str(order.id),
                items=[
                    OrderItemResponse(
                        **item.model_dump(),
                        menu_item_name=menu_items[item.menu_item_id].name
                    )
                    for item in order.items
                ]
            )
            for order in orders
        ]
    )


@router.post("/session/start")
async def start_session(
    customer_table: User = Depends(customer_tablet_user),
) -> SessionResponse:

    if customer_table.active_session is not None:
        raise HTTPException(
            status_code=409,
            detail="409 Conflict: Active session already exists for this user",
        )

    new_session = Session(
        status=SessionStatus.OPEN, session_start_time=datetime.now().isoformat()
    )
    await new_session.create()

    customer_table.active_session = str(new_session.id)
    await customer_table.save()

    return await generate_session_response(new_session)


@router.post("/session/lock")
async def lock_session(
    customer_table: User = Depends(customer_tablet_user),
) -> SessionResponse:
    session = await Session.get(customer_table.active_session)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: Cannot find session.",
        )

    session.status = SessionStatus.AWAITING_PAYMENT
    await session.save()

    return await generate_session_response(session)


class CompleteSessionResponse(BaseModel):
    user_id: str
    username: str
    active_session: Optional[str] = Field(default=None)
    session_id: str
    session_status: SessionStatus
    session_start_time: str
    session_end_time: str


@router.post("/session/complete/{customer_table_name}")
async def complete_session(
    customer_table_name: str, waiter: User = Depends(manager_or_waitstaff_user)
) -> CompleteSessionResponse:

    customer_table = await User.find_one(User.username == customer_table_name)
    if customer_table is None:
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: Cannot find customer table with the given name.",
        )

    session = await Session.get(customer_table.active_session)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: Cannot find session for the customer table.",
        )

    session.status = SessionStatus.CLOSED
    session.session_end_time = datetime.now().isoformat()
    await session.save()

    customer_table.active_session = None
    await customer_table.save()

    complete_session_response = CompleteSessionResponse(
        user_id=str(customer_table.id),
        username=customer_table.username,
        active_session=customer_table.active_session,
        session_id=str(session.id),
        session_status=session.status,
        session_start_time=session.session_start_time,
        session_end_time=session.session_end_time,
    )
    return complete_session_response


@router.get("/table/session")
async def get_table_session(
    customer_table: User = Depends(customer_tablet_user),
) -> SessionResponse | None:

    if customer_table.active_session is None:
        return None

    session = await Session.get(customer_table.active_session)
    if session is None:
        raise HTTPException(status_code=404, detail="404 Not Found: Session not found.")

    return await generate_session_response(session)
