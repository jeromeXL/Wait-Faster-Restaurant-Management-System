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
from utils.user_authentication import (
    customer_tablet_user,
    wait_staff_user,
    manager_or_waitstaff_user,
)
from fastapi.security import OAuth2PasswordBearer
from jwt import user_from_token
from fastapi_jwt import JwtAuthorizationCredentials
from bson import ObjectId
from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel
from router.session import SessionResponse, OrderResponse, generate_session_response
from models.user import User, UserRole
from models.order import Order, OrderStatus
from beanie.operators import Not, NE, And, Eq
from beanie import PydanticObjectId


class TableActivityResponse(BaseModel):
    table_number: int
    current_session: Optional[SessionResponse]


class ActivityPanelResponse(BaseModel):
    tables: List[TableActivityResponse]


router = APIRouter()


@router.get("/activity")
async def getPanel(user=Depends(manager_or_waitstaff_user)):

    response = ActivityPanelResponse(tables=[])

    all_users = await User.find(Eq(User.role, UserRole.CUSTOMER_TABLET)).to_list()
    for user in all_users:
        session = (
            None
            if user.active_session is None
            else await Session.get(PydanticObjectId(user.active_session))
        )

        if session is None:
            raise HTTPException(
                status_code=404, detail="404 Not Found: Session not found."
            )

        session_response = await generate_session_response(session)

        response.tables.append(
            TableActivityResponse(
                table_number=user.get_table_number(),
                current_session=session_response,
            )
        )

    return response
