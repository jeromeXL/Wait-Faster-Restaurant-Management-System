from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.menuItem import MenuItem

router = APIRouter()

class MenuItemCreate(BaseModel):
    name: str
    price: float
    health_requirements: List[str]
    description: str

class MenuItemResponse(BaseModel):
    id: str
    name: str
    price: float
    health_requirements: List[str]
    description: str
    
@router.get("/menu-items", response_model = List[MenuItem])
async def get_menu_items(filter: Optional[str] = None):
    if filter:
        filtered_items = await MenuItem.find('''Passing filters (TODO)''')
    else:
        filtered_items = await MenuItem.find_all()
    return filtered_items

@router.post("/menu-item/", response_model = MenuItemResponse)
async def create_menu_item(menu_item: MenuItemCreate):
    # Menu Item Create Validation Checks
    if not menu_item.name.strip():
        raise HTTPException(status_code=400, detail="Menu Item Name cannot be empty")
    if not menu_item.description.strip():
        raise HTTPException(status_code=400, detail="Menu Item Description cannot be empty")
    if menu_item.price <= 0:
        raise HTTPException(status_code=400, detail="Menu Item Price must be greater than 0")
    
    new_menu_item = MenuItem(**menu_item.model_dump())
    await new_menu_item.create()
    return MenuItemResponse(id=str(new_menu_item.id), **new_menu_item.model_dump())

@router.put("/menu-item/{menu_item_id}")
async def update_menu_item(menu_item_id: str, item: MenuItem):
    menu_item = await MenuItem.get_by_id(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await menu_item.update(**item.model_dump(exclude_unset=True))
    return menu_item

@router.delete("/menu-item/{menu_item_id}")
async def delete_menu_item(menu_item_id: int):
    menu_item = await MenuItem.get_by_id(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await menu_item.delete()
    return {"message": "Menu item deleted successfully"}