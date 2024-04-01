# from enum import Enum
# from typing import List, Optional, Set
# from pydantic import BaseModel
# from session import SessionResponse, OrderResponse
# from beanie import

from fastapi import APIRouter, HTTPException, Depends, status, Security
from models.session import SessionStatus, Session
from models.order import OrderStatus, OrderItem, Order
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from models.user import User, UserRole
from utils.user_authentication import customer_tablet_user, wait_staff_user, manager_or_waitstaff_user
from fastapi.security import OAuth2PasswordBearer
from jwt import user_from_token
from fastapi_jwt import JwtAuthorizationCredentials
from bson import ObjectId
from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel
from router.session import SessionResponse, OrderResponse
from models.user import User

class TableActivityDTO(BaseModel):
    TableNumber: int
    CurrentSession: Optional[SessionResponse]

class ActivityPanelResponse(BaseModel):
    Tables: List[TableActivityDTO]
    CurrentOrders: List[OrderResponse]

router = APIRouter()

@router.get("/Panel")
# async def getPanel(user=Depends(manager_or_waitstaff_user)):
async def getPanel():
    # Returns ActivityPanelResponse object

    # find active tables, for an active table, add current orders to Orderlist
    ActiveUsers = User.find_all(User.active_session != None).to_list()
    OrderList = []

    # build ActivityPanelResponse object accordingly and return

    # ActiveUsers2 = await User.find_all().to_list()
    # TablesList = [TableActivityDTO(**user.active_session.model_dump()) for user in ActiveUsers ]
    # ActiveSessions = Session.find_all(SessionStatus != SessionStatus.CLOSED.value).to_list()
    # ActiveSessions2 = Session.find_all().to_list()

    return ActiveUsers