from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Annotated, List, Optional
from router.session import OrderItemResponse
from utils.user_authentication import any_staff_user, customer_tablet_user
from models.session import Session
from models.order import OrderItem, Order, OrderStatus
from models.menuItem import MenuItem
from beanie.operators import In

router = APIRouter()


class OrderItemRequest(BaseModel):
    status: OrderStatus
    menu_item_id: str
    is_free: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]


class CreateOrderRequest(BaseModel):
    status: OrderStatus
    session_id: str
    items: List[OrderItemRequest]


class OrderResponse(BaseModel):
    id: str
    status: OrderStatus
    session_id: str
    items: List[OrderItemRequest]


@router.post("/order", response_model=OrderResponse)
async def create_order(request: CreateOrderRequest, user=Depends(customer_tablet_user)):

    validated_request = Order.model_validate(request.model_dump())
    session_id = validated_request.session_id
    order_items = validated_request.items

    # Check if the session exists
    """session = await Session.get(session_id)
    # UNCOMMENT AFTER SESSIONS ARE IMPLEMENTED
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")"""

    # Iterate over order items and create OrderItem documents
    created_order_items = []
    for item_request in order_items:
        validated_item_request = OrderItemRequest.model_validate(
            item_request.model_dump()
        )
        """menu_item = await MenuItem.get(item_request.menu_item_id)
        # UNCOMMENT AFTER CLARIFICATION ABOUT MENU IDS IN ORDERS
        
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        """
        order_item = OrderItem(
            status=validated_item_request.status,
            session_id=session_id,
            menu_item_id=validated_item_request.menu_item_id,
            is_free=validated_item_request.is_free,
            additional_notes=validated_item_request.additional_notes,
            preferences=validated_item_request.preferences,
        )
        await order_item.create()
        created_order_items.append(order_item)

    # Create an order and associate it with the session
    order = Order(
        status=OrderStatus.ORDERED, session_id=session_id, items=created_order_items
    )
    print("Order is: " + str(order.model_dump()))
    await order.create()
    orderResponse = OrderResponse(id=str(order.id), **order.model_dump(exclude="id"))
    print("Order Response is: " + str(orderResponse.model_dump()))
    return orderResponse


@router.get("/orders", response_model=List[OrderItemResponse])
async def get_orders(
    q: Annotated[list[OrderStatus] | None, Query()] = None, user=Depends(any_staff_user)
):
    return [
        OrderItemResponse(
            id=str(item.id),
            status=item.status,
            menu_item_id=item.menu_item_id,
            is_free=item.is_free,
        )
        for item in await OrderItem.find(
            In(
                OrderItem.status,
                q if q is not None else [val.value for val in OrderStatus],
            )
        ).to_list()
    ]
