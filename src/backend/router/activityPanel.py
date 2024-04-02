
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
from models.user import User, UserRole
from models.order import Order, OrderStatus
from beanie.operators import NE, Eq
from beanie import PydanticObjectId

class TableActivityDTO(BaseModel):
    TableNumber: int
    CurrentSession: Optional[SessionResponse]

class ActivityPanelResponse(BaseModel):
    Tables: List[TableActivityDTO]
    CurrentOrders: List[OrderResponse]

router = APIRouter()

@router.get("/Panel")
async def getPanel(user=Depends(manager_or_waitstaff_user)):
# async def getPanel():
    # Returns ActivityPanelResponse object

    # find active tables, for an active table, add current orders to Orderlist
    # filter for table users
    Tables = []
    ActiveSessions = []
    allusers = await User.find_all().to_list()
    for user in allusers:
        if user.role == UserRole.CUSTOMER_TABLET:
            Tables.append(user)
            if user.active_session != None:
                ActiveSessions.append(user.active_session)

    ActiveOrders = []
    # for each active session string, find by id and get its active orders
    for sessionId in ActiveSessions:
        session = await Session.find_one(Session.id == PydanticObjectId(sessionId))
        if session.orders != None:
            for orderId in session.orders:
                # lookup each order, if active, add to activeOrderIds
                order = await Order.find_one(Order.id == PydanticObjectId(orderId))
                if order.status == OrderStatus.ORDERED or OrderStatus.PREPARING:
                    ActiveOrders.append(order)

    # if active, add active orders to CurrentOrders list
    # build ActivityPanelResponse object accordingly and return

    # TablesList = [TableActivityDTO(**user.active_session.model_dump()) for user in ActiveUsers ]

    return Tables