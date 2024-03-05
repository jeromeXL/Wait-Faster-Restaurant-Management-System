from typing import List, Optional
from fastapi import APIRouter, HTTPException
from models import menuItem

router = APIRouter()

# Sample in-memory database to store menu items
menu_items = {}
menu_item_id = 0

@router.get("/menu-items")
async def get_menu_items(filter: Optional[str] = None):
    if filter:
        # Confirm Filter Types
        pass
    return menu_items.values()

@router.post("/menu-item/")
async def create_menu_item(menu_item: menuItem):
    global menu_item_id
    menu_item_id += 1
    menu_items[menu_item_id] = menu_item
    return {"id": menu_item_id, **menu_item.dict()}

@router.put("/menu-item/{menu_item_id}")
async def update_menu_item(menu_item_id: int, menu_item: menuItem):
    if menu_item_id not in menu_items:
        raise HTTPException(status_code=404, detail="Menu item not found")
    menu_items[menu_item_id] = menu_item
    return {"id": menu_item_id, **menu_item.dict()}

@router.delete("/menu-item/{menu_item_id}")
async def delete_menu_item(menu_item_id: int):
    if menu_item_id not in menu_items:
        raise HTTPException(status_code=404, detail="Menu item not found")
    del menu_items[menu_item_id]
    return {"message": "Menu item deleted"}