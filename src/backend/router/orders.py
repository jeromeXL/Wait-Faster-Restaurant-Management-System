from itertools import chain
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Annotated, List, Optional
from utils.user_authentication import any_staff_user, customer_tablet_user
from models.session import Session
from models.order import OrderItem, Order, OrderStatus, valid_transitions
from models.menuItem import MenuItem
from beanie.operators import In

router = APIRouter()


class OrderItemResponse(BaseModel):
    id: str
    status: OrderStatus
    menu_item_id: str
    is_free: bool
    preferences: Optional[List[str]] = Field(default=None)
    additional_notes: Optional[str] = Field(default=None)


class OrderResponse(BaseModel):
    id: str
    status: OrderStatus
    session_id: str
    items: List[OrderItemResponse]


class CreateOrderItemRequest(BaseModel):
    menu_item_id: str
    is_free: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]


class CreateOrderRequest(BaseModel):
    session_id: str
    items: List[CreateOrderItemRequest]


@router.post("/order", response_model=OrderResponse)
async def create_order(request: CreateOrderRequest, user=Depends(customer_tablet_user)):

    session_id = request.session_id
    order_items = request.items

    # Check if the session exists
    session = await Session.get(PydanticObjectId(session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Iterate over order items and create OrderItem documents
    created_order_items = []
    for item_request in order_items:
        menu_item = await MenuItem.get(PydanticObjectId(item_request.menu_item_id))

        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")

        order_item = OrderItem(
            id=PydanticObjectId(),
            status=OrderStatus.ORDERED,
            menu_item_id=PydanticObjectId(item_request.menu_item_id),
            is_free=item_request.is_free,
            additional_notes=item_request.additional_notes,
            preferences=item_request.preferences,
        )
        created_order_items.append(order_item)

    # Create an order and associate it with the session
    order = Order(
        status=OrderStatus.ORDERED,
        session_id=PydanticObjectId(session_id),
        items=created_order_items,
    )
    await order.create()
    orderResponse = OrderResponse(
        id=str(order.id), **order.model_dump(exclude=set(["id"]))
    )
    return orderResponse


class OrderUpdateRequest(BaseModel):
    status: OrderStatus


@router.post("/order/{order_id}/{item_id}", response_model=Order)
async def update_order_status(
    order_id: str,
    item_id: str,
    request: OrderUpdateRequest,
    user=Depends(any_staff_user),
):

    # Check if the order exists
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if the order contains the specified item
    item_to_update = None
    for item in order.items:
        if item.menu_item_id == PydanticObjectId(item_id):
            item_to_update = item
            break
    if not item_to_update:
        raise HTTPException(status_code=404, detail="Item not found in the order")

    current_status = item_to_update.status
    new_status = request.status

    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(status_code=422, detail="Invalid state transition")

    # Update the status of the item
    item_to_update.status = new_status

    # Update the order status based on item statuses
    if all(item.status == new_status for item in order.items):
        order.status = new_status

    await order.save()

    return order


class GetOrdersResponse(BaseModel):
    orders: List[OrderResponse]


@router.get("/orders", response_model=GetOrdersResponse)
async def get_orders(
    statuses: Annotated[list[OrderStatus] | None, Query()] = None,
    user=Depends(any_staff_user),
):
    orders = await Order.find(
        In(
            Order.status,
            statuses if statuses is not None else [val.value for val in OrderStatus],
        )
    ).to_list()

    order_responses: List[OrderResponse] = [
        OrderResponse(
            status=order.status,
            id=str(order.id),
            session_id=str(order.session_id),
            items=[
                OrderItemResponse(
                    **item.model_dump(),
                )
                for item in order.items
            ],
        )
        for order in orders
    ]
    return GetOrdersResponse(orders=order_responses)
