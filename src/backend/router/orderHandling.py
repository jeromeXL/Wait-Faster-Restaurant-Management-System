from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from utils.user_authentication import any_staff_user
from models.session import Session
from models.order import OrderItem, Order, OrderStatus, valid_transitions
from models.menuItem import MenuItem

router = APIRouter()


class OrderUpdateRequest(BaseModel):
    status: OrderStatus


@router.post("/order/{order_id}/{item_id}", response_model=Order)
async def update_order_status(
    order_id: str,
    item_id: str,
    request: OrderUpdateRequest,
    user=Depends(any_staff_user),
):
    validated_request = OrderUpdateRequest.model_validate(request.model_dump())

    # Check if the order exists
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if the order contains the specified item
    item_to_update = None
    for item in order.items:
        if item.menu_item_id == item_id:
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

    return order


# @router.post("/order/{order_id}", response_model=Order)
# async def update_order_status(order_id: str, request: OrderUpdateRequest):
#     validated_request = OrderUpdateRequest.model_validate(request.model_dump())
#     print("Order id is: " + str(order_id))

#     # Check if the order exists
#     order = await Order.get(order_id)
#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")

#     current_status = order.status
#     new_status = request.status

#     if new_status not in valid_transitions.get(current_status, []):
#         raise HTTPException(status_code=422, detail="Invalid state transition")

#     # Update the status of the item
#     order.status = new_status

#     # Update the order status based on item statuses
#     for item in order.items:
#         item.status = order.status

#     return order
