from beanie import Document, PydanticObjectId
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import Field


class AssistanceRequestStatus(Enum):
    OPEN = 0
    HANDLING = 1
    CLOSED = 2
    CANCELLED = 3


class AssistanceRequest(Document):
    status: AssistanceRequestStatus
    session_id: str
    request_start_time: str
    request_notes: Optional[str] = Field(default=None)

valid_request_state_transitions = {
    AssistanceRequestStatus.OPEN: [AssistanceRequestStatus.HANDLING, AssistanceRequestStatus.CANCELLED],
    AssistanceRequestStatus.HANDLING: [AssistanceRequestStatus.OPEN, AssistanceRequestStatus.CLOSED],
    AssistanceRequestStatus.CLOSED: [AssistanceRequestStatus.HANDLING]
}