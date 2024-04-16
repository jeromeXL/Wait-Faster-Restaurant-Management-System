from beanie import Document, PydanticObjectId
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from models.order import OrderStatus


class AssistanceRequestStatus(int, Enum):
    OPEN = 0
    HANDLING = 1
    CLOSED = 2
    CANCELLED = 3


class AssistanceRequest(BaseModel):
    start_time: str
    end_time: Optional[str] = None
    notes: Optional[str] = None
    status: AssistanceRequestStatus


class AssistanceRequestsDetails(BaseModel):
    current: Optional[AssistanceRequest]
    handled: List[AssistanceRequest]


valid_request_state_transitions = {
    AssistanceRequestStatus.OPEN: [
        AssistanceRequestStatus.HANDLING,
        AssistanceRequestStatus.CANCELLED,
    ],
    AssistanceRequestStatus.HANDLING: [
        AssistanceRequestStatus.OPEN,
        AssistanceRequestStatus.CLOSED,
    ],
    AssistanceRequestStatus.CLOSED: [],
}


class SessionStatus(int, Enum):
    OPEN = 0
    AWAITING_PAYMENT = 1
    CLOSED = 2


class Session(Document):
    status: SessionStatus
    orders: List[PydanticObjectId] = []
    session_start_time: str
    session_end_time: Optional[str] = Field(default=None)
    assistance_requests: AssistanceRequestsDetails
