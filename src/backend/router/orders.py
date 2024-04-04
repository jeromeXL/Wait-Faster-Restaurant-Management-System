from itertools import chain
from beanie import PydanticObjectId
from beanie.operators import NE
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Annotated, List, Optional
from models.user import User
from utils.user_authentication import any_staff_user, customer_tablet_user
from models.session import Session
from models.order import OrderItem, Order, OrderStatus, valid_transitions
from models.menuItem import MenuItem
from beanie.operators import In, And


router = APIRouter()


class OrderItemResponse(BaseModel):
    id: str
    status: OrderStatus
    menu_item_id: str
    menu_item_name: str
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

    # Get all menu items mentioned as a dictionary
    menu_item_ids = [
        PydanticObjectId(item_request.menu_item_id) for item_request in order_items
    ]
    menu_items = {
        item.id: item
        for item in await MenuItem.find(In(MenuItem.id, menu_item_ids)).to_list()
    }
    if len(menu_items) != len(menu_item_ids):
        raise HTTPException(
            status_code=404,
            detail="404 Not Found: One or more menu_item_id(s) are not valid menu items",
        )

    # Iterate over order items and create OrderItem documents
    created_order_items: List[OrderItem] = []
    created_order_items_responses: List[OrderItemResponse] = []
    for item_request in order_items:
        order = OrderItem(
            id=PydanticObjectId(),
            status=OrderStatus.ORDERED,
            menu_item_id=PydanticObjectId(item_request.menu_item_id),
            is_free=item_request.is_free,
            additional_notes=item_request.additional_notes,
            preferences=item_request.preferences,
        )
        created_order_items.append(order)
        created_order_items_responses.append(
            OrderItemResponse(
                **order.model_dump(), menu_item_name=menu_items[order.menu_item_id].name
            )
        )

    # Create an order and associate it with the session
    order = Order(
        status=OrderStatus.ORDERED,
        session_id=PydanticObjectId(session_id),
        items=created_order_items,
    )
    await order.create()
    orderResponse = OrderResponse(
        id=str(order.id),
        **order.model_dump(exclude={"id", "items"}),
        items=created_order_items_responses
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
        if item.id == PydanticObjectId(item_id):
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


class CustomerOrderResponse(BaseModel):
    table_id: int
    orders: List[OrderResponse]


class GetOrdersResponse(BaseModel):
    customer_orders: List[CustomerOrderResponse]


@router.get("/orders")
async def get_orders(
    statuses: Annotated[list[OrderStatus] | None, Query()] = None,
    user=Depends(any_staff_user),
):

    # Get all active sessions.
    users_with_sessions = await User.find(NE(User.active_session, None)).to_list()

    # Get session Ids and find all orders with those session ids.
    session_ids = [user.active_session for user in users_with_sessions]
    orders = await Order.find(
        And(
            In(
                Order.status,
                (
                    statuses
                    if statuses is not None
                    else [val.value for val in OrderStatus]
                ),
            ),
            In(Order.session_id, session_ids),
        )
    ).to_list()

    menu_item_ids = [item.menu_item_id for order in orders for item in order.items]
    menu_items = {
        item.id: item
        for item in await MenuItem.find(In(MenuItem.id, menu_item_ids)).to_list()
    }

    outgoing_response = [
        CustomerOrderResponse(
            table_id=user.get_table_number(),
            orders=[
                OrderResponse(
                    status=order.status,
                    id=str(order.id),
                    session_id=str(order.session_id),
                    items=[
                        OrderItemResponse(
                            **item.model_dump(),
                            menu_item_name=menu_items[item.menu_item_id].name
                        )
                        for item in order.items
                    ],
                )
                for order in filter(
                    lambda order: order.session_id == user.active_session, orders
                )
            ],
        )
        for user in users_with_sessions
    ]
    return GetOrdersResponse(
        customer_orders=[
            value for value in filter(lambda x: len(x.orders) > 0, outgoing_response)
        ]
    )
