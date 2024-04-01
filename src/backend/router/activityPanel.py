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
from session import SessionResponse, OrderResponse
from models.user import User
# from beanie import

class TableActivityDTO(BaseModel):
    TableNumber = int
    CurrentSession: Optional[SessionResponse]

class ActivityPanelResponse(BaseModel):
    Tables: List[TableActivityDTO]
    CurrentOrders: List[OrderResponse]
    # CurrentDayOrders?
    # what do we need current day completed Orders for?

router = APIRouter()

@router.get("/Panel")
async def getPanel(user=Depends(manager_or_waitstaff_user)):
    # Returns ActivityPanelResponse object

    # find active tables, for an active table, add current orders to list
    ActiveUsers = await User.find_all(User.active_session != None).to_list()
    # TablesList = [TableActivityDTO(**user.active_session.model_dump()) for user in ActiveUsers ]
    OrderList = []

    # categories = await Category.all().sort("+index").to_list()
    # return await generateMenu(categories)