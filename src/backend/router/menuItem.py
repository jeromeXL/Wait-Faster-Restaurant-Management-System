from typing import List, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from utils.user_authentication import current_user
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


@router.get("/menu-items", response_model=List[MenuItemResponse])
async def get_menu_items(current_user=Depends(current_user)):

    filtered_items = await MenuItem.find_all().to_list()
    return [MenuItemResponse(**item.model_dump()) for item in filtered_items]


@router.post("/menu-item/", response_model=MenuItemResponse)
async def create_menu_item(menu_item: MenuItemCreate):
    validated_menu_item = MenuItem.model_validate(menu_item.model_dump())
    # Menu Item Create Validation Checks
    if not validated_menu_item.name.strip():
        raise HTTPException(
            status_code=400, detail="Menu Item Name cannot be empty")
    if not validated_menu_item.description.strip():
        raise HTTPException(
            status_code=400, detail="Menu Item Description cannot be empty")
    if validated_menu_item.price <= 0:
        raise HTTPException(
            status_code=400, detail="Menu Item Price must be greater than 0")
    # Pydantic Validation
    new_menu_item = MenuItem(**validated_menu_item.model_dump())
    await new_menu_item.create()
    return MenuItemResponse(**new_menu_item.model_dump())


@router.put("/menu-item/{menu_item_id}", response_model=MenuItemResponse)
async def update_menu_item(menu_item_id: str, updatedMenuItem: MenuItemCreate):
    menu_item = await MenuItem.get(menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    validated_menu_item = MenuItem.model_validate(updatedMenuItem.model_dump())
    menu_item.name = validated_menu_item.name
    menu_item.price = validated_menu_item.price
    menu_item.health_requirements = validated_menu_item.health_requirements
    menu_item.description = validated_menu_item.description
    await menu_item.save()
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
    return {"count": MenuItemCount}
