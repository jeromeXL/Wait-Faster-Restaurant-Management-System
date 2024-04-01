from beanie import Document
from pydantic import BaseModel
from session import Tab

class TableActivityDTO(BaseModel):
    TableNumber: str
    CurrentSession: SessionDTO

class ActivityPanelResponse(BaseModel):
    TableDTOs: List[TabelActivityDTO]
    CurrentOrders: List[OrderDTO]
    CurrentDayCompletedOrders: List[OrderDTO]
    