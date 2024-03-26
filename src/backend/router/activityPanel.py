
from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel
from session import SessionResponse, OrderResponse
# from beanie import

class TableActivityDTO(BaseModel):
    TableNumber = int
    CurrentSession: Optional[SessionResponse]

class ActivityPanelResponse(BaseModel):
    Tables: List[TableActivityDTO]
    CurrentOrders: List[OrderResponse]
    # CurrentDayOrders?
    # what do we need current day completed Orders for?