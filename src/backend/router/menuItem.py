from typing import List, Optional
from fastapi import APIRouter, HTTPException
from models.menuItem import MenuItem

router = APIRouter()

@router.get("/menu-items", response_model = List[MenuItem])
async def get_menu_items(filter: Optional[str] = None):
    if filter:
        filtered_items = await MenuItem.find('''Passing filters (TODO)''')
    else:
        filtered_items = await MenuItem.find_all()
    return filtered_items

@router.post("/menu-item/", response_model = dict)
async def create_menu_item(menu_item: MenuItem):
    menu_item = MenuItem(**menu_item.dict())
    await menu_item.create()
    return {"id": str(menu_item.id), **menu_item.dict()}

@router.put("/menu-item/{menu_item_id}")
async def update_menu_item(menu_item_id: str, item: MenuItem):
    menu_item = await MenuItem.get_by_id(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await menu_item.update(**item.dict(exclude_unset=True))
    return menu_item

@router.delete("/menu-item/{menu_item_id}")
async def delete_menu_item(menu_item_id: int):
    menu_item = await MenuItem.get_by_id(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await menu_item.delete()
    return {"message": "Menu item deleted successfully"}