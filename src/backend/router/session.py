from functools import reduce
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from models.menuItem import MenuItem
from models.order import Order
from router.orders import OrderItemResponse, OrderResponse
from models.session import (
    AssistanceRequest,
    AssistanceRequestsDetails,
    AssistanceRequestStatus,
    SessionStatus,
    Session,
    valid_request_state_transitions,
)
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models.user import User
from utils.user_authentication import (
    customer_tablet_user,
    manager_or_waitstaff_user,
)
from beanie.operators import In
from socket_io import sio

router = APIRouter()


class SessionResponse(BaseModel):
    id: str
    status: SessionStatus
    orders: Optional[List[OrderResponse]] = Field(default=None)
    session_start_time: str
    session_end_time: Optional[str] = Field(default=None)
    assistance_requests: AssistanceRequestsDetails


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
        status=SessionStatus.OPEN,
        session_start_time=datetime.now().isoformat(),
        assistance_requests=AssistanceRequestsDetails(current=None, handled=[]),
    )
    await new_session.create()

    customer_table.active_session = str(new_session.id)
    await customer_table.save()
    await sio.emit("activity_panel_updated")
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

    await sio.emit("activity_panel_updated")
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
    await sio.emit("session_completed", {"session_id": str(session.id)})
    await sio.emit("activity_panel_updated")
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


class CreateAssistanceRequest(BaseModel):
    notes: Optional[str] = None


@router.put("/session/assistance-request/create")
async def raise_assistance_request(
    req: CreateAssistanceRequest = CreateAssistanceRequest(notes=None),
    customer_tablet: User = Depends(customer_tablet_user),
) -> SessionResponse:

    if customer_tablet.active_session is None:
        raise HTTPException(
            status_code=404, detail="404 Not Found: The user does not have a session."
        )

    session = await Session.get(customer_tablet.active_session)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: Cannot find session for the customer tablet.",
        )

    # Check if the session already has an active help request.
    if session.assistance_requests.current is not None:
        raise HTTPException(
            status_code=400,
            detail="400 Bad Request: Customer tablet already has an active help request.",
        )

    # Set the current assistance request.
    session.assistance_requests.current = AssistanceRequest(
        start_time=datetime.now().isoformat(),
        end_time=None,
        notes=req.notes,
        status=AssistanceRequestStatus.OPEN,
    )

    await session.save()
    await sio.emit("assistance_request_update", session.model_dump())

    return await generate_session_response(session)


class StaffUpdateAssistanceRequest(BaseModel):
    session_id: str
    status: AssistanceRequestStatus


@router.put("/session/assistance-request/staff-update")
async def staff_update_assistance_request(
    req: StaffUpdateAssistanceRequest, user: User = Depends(manager_or_waitstaff_user)
) -> SessionResponse:

    # Fetch Session
    id: PydanticObjectId
    try:
        id = PydanticObjectId(req.session_id)
    except Exception:
        raise HTTPException(
            status_code=400, detail="Could not parse session_id to a valid object id."
        )

    session = await Session.get(id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Check there is an active help request to update.
    if session.assistance_requests.current is None:
        raise HTTPException(
            status_code=404,
            detail="The session currently does not have a help request.",
        )

    # Check the update is valid.
    if req.status not in valid_request_state_transitions:
        raise HTTPException(
            status_code=422,
            detail="Cannot transition assistance request to the given status.",
        )

    # Update the status.
    session.assistance_requests.current.status = req.status

    if session.assistance_requests.current.status == AssistanceRequestStatus.CLOSED:
        # Close this assistance request, to be ready for the next one to start.
        session.assistance_requests.current.end_time = datetime.now().isoformat()
        session.assistance_requests.handled.append(session.assistance_requests.current)
        session.assistance_requests.current = None

    await session.save()

    await sio.emit("assistance_request_update", session.model_dump())
    return await generate_session_response(session)


class StaffReopenAssistanceRequest(BaseModel):
    session_id: str


@router.put("/session/assistance-request/staff-reopen")
async def staff_reopen_assistance_request(
    req: StaffReopenAssistanceRequest, user: User = Depends(manager_or_waitstaff_user)
) -> SessionResponse:

    # Fetch Session
    id: PydanticObjectId
    try:
        id = PydanticObjectId(req.session_id)
    except Exception:
        raise HTTPException(
            status_code=400, detail="Could not parse session_id to a valid object id."
        )

    session = await Session.get(id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Check there is an active help request to update.
    if session.assistance_requests.current is not None:
        raise HTTPException(
            status_code=404,
            detail="Cannot reopen an assistance request for this session because there is a new assistance request.",
        )

    # Check there is at least one assistance request.
    if len(session.assistance_requests.handled) == 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot reopen an assistance request because there are none.",
        )

    # Extract the oldest help request.
    most_recent_request = reduce(
        lambda a, b: a if a.end_time > b.end_time else b,  # type: ignore
        session.assistance_requests.handled,
    )

    # Remove the most recent request from the handled list and add it to the current value.
    session.assistance_requests.handled = [
        item
        for item in session.assistance_requests.handled
        if item.end_time != most_recent_request.end_time
    ]
    most_recent_request.end_time = None
    most_recent_request.status = AssistanceRequestStatus.HANDLING
    session.assistance_requests.current = most_recent_request

    await session.save()
    await sio.emit("assistance_request_update", session.model_dump())
    return await generate_session_response(session)


@router.put("/session/assistance-request/tablet-resolve")
async def tablet_resolve_assistance_request(
    customer_tablet: User = Depends(customer_tablet_user),
) -> SessionResponse:

    if customer_tablet.active_session is None:
        raise HTTPException(
            status_code=404, detail="404 Not Found: The user does not have a session."
        )

    session = await Session.get(customer_tablet.active_session)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: Cannot find session for the customer tablet.",
        )

    # Check there is an active help request to update.
    if session.assistance_requests.current is None:
        raise HTTPException(
            status_code=404,
            detail="The session currently does not have a help request.",
        )

    # Close the assistance request.
    session.assistance_requests.current.status = (
        AssistanceRequestStatus.CANCELLED
        if session.assistance_requests.current.status == AssistanceRequestStatus.OPEN
        else AssistanceRequestStatus.CLOSED
    )
    session.assistance_requests.current.end_time = datetime.now().isoformat()
    session.assistance_requests.handled.append(session.assistance_requests.current)
    session.assistance_requests.current = None

    await session.save()
    await sio.emit("assistance_request_update", session.model_dump())
    return await generate_session_response(session)
