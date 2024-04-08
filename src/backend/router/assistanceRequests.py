from datetime import datetime
from itertools import chain
from beanie import PydanticObjectId
from beanie.operators import NE
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Annotated, List, Optional
from models.user import User
from utils.user_authentication import any_staff_user, customer_tablet_user
from models.session import Session
from models.order import OrderItem, Order, OrderStatus, valid_transitions
from models.menuItem import MenuItem
from models.assistanceRequests import AssistanceRequest, AssistanceRequestStatus
from beanie.operators import In, And


router = APIRouter()


class CreateAssistanceRequest(BaseModel):
    status: AssistanceRequestStatus
    session_id: str
    request_start_time: str
    request_notes: Optional[str] = Field(default=None)

class AssistanceRequestResponse(BaseModel):
    status: AssistanceRequestStatus
    id: PydanticObjectId
    session_id: str
    request_start_time: str
    request_notes: Optional[str] = Field(default=None)

class AssistanceRequestUpdate(BaseModel):
    status: AssistanceRequestStatus


@router.post("/assistance/create", response_model=AssistanceRequestResponse)
async def create_assistance_request(request: CreateAssistanceRequest, user=Depends(customer_tablet_user)):

    session_id = request.session_id
    # Check if the session exists
    session = await Session.get(PydanticObjectId(session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Create an order and associate it with the session
    assistance_request = AssistanceRequest(
        status=AssistanceRequestStatus.OPEN,
        session_id=PydanticObjectId(session_id),
        request_start_time=str(datetime.now().isoformat()),
        request_notes=request.request_notes
    )
    await assistance_request.create()
    assistance_request_response = AssistanceRequestResponse(
        id=str(assistance_request.id),
        **assistance_request.model_dump(exclude={"id"})
    )
    return assistance_request_response


@router.post("/assistance/{request_id}", response_model=AssistanceRequest)
async def update_assistance_request_status(
    request_id: str,
    request: AssistanceRequestUpdate,
    user=Depends(any_staff_user),
):

    assistance_request = await AssistanceRequest.get(request_id)
    if not assistance_request:
        raise HTTPException(status_code=404, detail="Assistance Request not found")

    current_status = assistance_request.status
    new_status = request.status

    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(status_code=422, detail="Invalid Assistnace Request State transition")

    # Update the status of the item
    assistance_request.status = new_status


    await assistance_request.save()

    return assistance_request




@router.get("/assistance/requests")
async def get_all_assistance_requests():
    assistance_requests = await AssistanceRequest.find(
        And(
            NE(AssistanceRequest.status, AssistanceRequestStatus.COMPLETED),
            NE(AssistanceRequest.status, AssistanceRequestStatus.CANCELLED)
        )
    ).to_list()
    return [
        AssistanceRequestResponse(
            id=str(req.id),
            status=req.status,
            session_id=str(req.session_id),
            request_start_time=req.request_start_time,
            request_notes=req.request_notes,
        )
        for req in assistance_requests
    ]

