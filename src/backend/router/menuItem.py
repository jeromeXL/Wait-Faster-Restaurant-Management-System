from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from models.menuItem import MenuItem

router = APIRouter()

class MenuItemCreate(BaseModel):
    name: str
    price: float
    dietary_details: List[str]
    description: str

class MenuItemResponse(BaseModel):
    id: str
    name: str
    price: float
    dietary_details: List[str]
    description: str
    
@router.get("/menu-items", response_model = List[MenuItemResponse])
async def get_menu_items(filter: Optional[str] = Query()):
    if filter:
        filtered_items = await MenuItem.find_all(filter in MenuItem.name)
    else:
        filtered_items = await MenuItem.find_all()
    return [MenuItemResponse(**item.dict()) for item in filtered_items]

@router.post("/menu-item/", response_model = MenuItemResponse)
async def create_menu_item(menu_item: MenuItemCreate):
    try:
        validated_menu_item = MenuItem.model_validate(menu_item.model_dump())
        # Menu Item Create Validation Checks
        if not validated_menu_item.name.strip():
            raise HTTPException(status_code=400, detail="Menu Item Name cannot be empty")
        if not validated_menu_item.description.strip():
            raise HTTPException(status_code=400, detail="Menu Item Description cannot be empty")
        if validated_menu_item.price <= 0:
            raise HTTPException(status_code=400, detail="Menu Item Price must be greater than 0")
        # Pydantic Validation
        new_menu_item = MenuItem(**validated_menu_item.model_dump())
        await new_menu_item.create()
        return MenuItemResponse(**new_menu_item.model_dump())
    except Exception as e:
        raise ValueError(f"Failed to validate. {e}")

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