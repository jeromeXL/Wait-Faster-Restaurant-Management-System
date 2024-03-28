from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from models.session import Session
from models.order import OrderItem, Order, OrderStatus, valid_transitions
from models.menuItem import MenuItem

router = APIRouter()


class OrderUpdateRequest(BaseModel):
    status: OrderStatus

@router.post("/order/{order_id}/{item_id}", response_model=Order)
async def update_order_status(order_id : str, item_id : str, request: OrderUpdateRequest):
    validated_request = OrderUpdateRequest.model_validate(request.model_dump())
    print("Order id is: " + str(order_id))
    print("item id is : " + str(item_id))
    # Check if the order exists
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ''' Uncomment Later
    # Check if the menu item exists
    menu_item = await MenuItem.get(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    '''

    # Check if the order contains the specified menu item
    if not any(item.menu_item_id == item_id for item in order.items):
        raise HTTPException(status_code=404, detail="Order does not contain this menu item")

    current_status = order.status
    new_status = request.status

    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(status_code=422, detail="Invalid state transition")

    # Update the status of the order item
    order.status = new_status
    return order

@router.get("/order/health")
async def order_health():
    print("HEALTHY")
    return 0


