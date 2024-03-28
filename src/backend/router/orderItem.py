from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from models.session import Session
from models.order import OrderItem, Order, OrderStatus
from models.menuItem import MenuItem

router = APIRouter()


class OrderItemRequest(BaseModel):
    status: OrderStatus
    menu_item_id: str
    isFree: bool
    preferences: Optional[List[str]]
    additional_notes: Optional[str]

class CreateOrderRequest(BaseModel):
    status: OrderStatus
    session_id: str
    items: List[OrderItemRequest]

@router.post("/order", response_model=Order)
async def create_order(request: CreateOrderRequest):
    print("ENDPOINT CALLED")
    validated_request = Order.model_validate(request.model_dump())
    print("Reached here")
    session_id = validated_request.session_id
    order_items = validated_request.items
    
    # Check if the session exists
    '''session = await Session.get(session_id)
    # UNCOMMENT AFTER SESSIONS ARE IMPLEMENTED
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")'''

    # Iterate over order items and create OrderItem documents
    created_order_items = []
    for item_request in order_items:
        validated_item_request = OrderItemRequest.model_validate(item_request.model_dump())
        '''menu_item = await MenuItem.get(item_request.menu_item_id)
        # UNCOMMENT AFTER CLARIFICATION ABOUT MENU IDS IN ORDERS
        
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        '''
        order_item = OrderItem(
            status=validated_item_request.status,
            session_id=session_id,
            menu_item_id=validated_item_request.menu_item_id,
            isFree=validated_item_request.isFree,
            additional_notes=validated_item_request.additional_notes,
            preferences=validated_item_request.preferences
        )
        await order_item.create()
        created_order_items.append(order_item)

    # Create an order and associate it with the session
    order = Order(status=OrderStatus.ORDERED, session_id = session_id, items = created_order_items)
    print("Order is: " + str(order.model_dump()))
    await order.create()

    return order

@router.get("/order/health")
async def order_health():
    print("HEALTHY")
    return 0


