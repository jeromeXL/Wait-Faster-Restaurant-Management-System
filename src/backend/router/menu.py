import json
import os.path
from datetime import timedelta
from typing import Dict, List
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from models.menuItem import MenuItem
from models.category import Category
from utils.user_authentication import admin_user, current_user
from models.auth import AccessToken, RefreshToken
from models.user import User
# from models.menu import Category
from utils.password import hash_password
from jwt import access_security, refresh_security
# from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/menu", tags=["Menu"])

class Menu(BaseModel):
    categories: List[Category]
class MenuResponse(BaseModel):
    Menu: Menu
    Items: Dict[str, MenuItem]
    
@router.get("")
async def getMenu(user = Depends(current_user)):
    
    categories = await Category.all().sort("+index").to_list()

    ## Get all menu items associated with the categories
    items_to_fetch = set([PydanticObjectId(menu_item) for category in categories for menu_item in category.menu_items])

    items_exist = False \
        if len(items_to_fetch) == 0 \
        else await MenuItem.find(Category.id in items_to_fetch).exists()
    
    if not items_exist:
        return MenuResponse(
            Menu=Menu(categories=categories),
            Items= {}
        )

    menu_items = await MenuItem.find(Category.id in items_to_fetch).to_list()
    return MenuResponse(
        Menu=Menu(categories=categories),
        Items= {str(menu_item.id) : menu_item for menu_item in menu_items}
    )

class ChangeOrderRequest(BaseModel):
    order: List[str]

@router.put("/reorder")
async def reorderMenu(req: ChangeOrderRequest, manager = Depends(admin_user)):
    # Check that all the ids are real
    
    categories = await Category.all().to_list()
    if len(categories) != len(req.order):
        raise HTTPException(status_code=400, detail="Request must include a list of all category ids in the wanted order.")
    
    all_given_categories_exist = all([str(category.id) in req.order for category in categories])
    if not all_given_categories_exist:
        raise HTTPException(status_code=400, detail="One or more of the given category ids do not exist.")

    # Reorder the categories according to the given id list.
    for (index, categoryId) in enumerate(req.order):
        category = next(filter(lambda x: str(x.id) == categoryId, categories))
        category.index = index

    for category in categories:
        await category.save()
        
    return

