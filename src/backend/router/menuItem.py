from typing import List, Optional, Set
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from models.menuItem import MenuItem

router = APIRouter()

class MenuItemCreate(BaseModel):
    name: str
    price: float
    health_requirements: Set[str]
    description: str

class MenuItemResponse(BaseModel):
    id: str
    name: str
    price: float
    health_requirements: Set[str]
    description: str
    
@router.get("/menu-items", response_model = List[MenuItemResponse])
async def get_menu_items(filter: Optional[str] = Query()):
    if filter:
        filtered_items = await MenuItem.find_all(MenuItem.name.__contains__(filter))
    else:
        filtered_items = await MenuItem.find_all()
    return [MenuItemResponse(id=str(item.id), **item.dict()) for item in filtered_items]

@router.post("/menu-item/", response_model = MenuItemResponse)
async def create_menu_item(menu_item: MenuItemCreate):
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
    print("ID is: "+ str(new_menu_item.id))
    print("Created menu item is: "+ str(new_menu_item))
    print(MenuItemResponse(**new_menu_item.model_dump()))
    return MenuItemResponse(**new_menu_item.model_dump())

@router.put("/menu-item/{menu_item_id}", response_model = MenuItemResponse)
async def update_menu_item(menu_item_id: str, updatedMenuItem: MenuItemCreate):
    menu_item = await MenuItem.get(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    validated_menu_item = MenuItem.model_validate(updatedMenuItem.model_dump())
    menu_item.name = validated_menu_item.name
    menu_item.price = validated_menu_item.price
    menu_item.health_requirements = validated_menu_item.health_requirements
    menu_item.description = validated_menu_item.description
    return MenuItemResponse(**menu_item.model_dump())

@router.delete("/menu-item/{menu_item_id}")
async def delete_menu_item(menu_item_id: str):
    menu_item = await MenuItem.get(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await menu_item.delete()
    return {"message": "Menu item deleted successfully"}

@router.get("/allMenuItems")
async def createCategory():
    MenuItemCount = await MenuItem.count()
    print(f"There are {MenuItemCount} menu items")
    return {"count" : MenuItemCount}