import json
import os.path
from datetime import timedelta
from typing import Dict, List
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from router.category import CategoryResponse
from router.menuItem import MenuItemResponse
from models.menuItem import MenuItem
from models.category import Category
from utils.user_authentication import admin_user, current_user, manager_user
from models.auth import AccessToken, RefreshToken
from models.user import User
# from models.menu import Category
from utils.password import hash_password
from jwt import access_security, refresh_security
# from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/menu", tags=["Menu"])


class MenuDTO(BaseModel):
    categories: List[CategoryResponse]


class MenuResponse(BaseModel):
    Menu: MenuDTO
    Items: Dict[str, MenuItemResponse]


async def generateMenu(categories: List[Category]) -> MenuResponse:

    # Get all menu items associated with the categories
    items_to_fetch = set([PydanticObjectId(menu_item)
                         for category in categories for menu_item in category.menu_items])

    items_exist = False \
        if len(items_to_fetch) == 0 \
        else await MenuItem.find(Category.id in items_to_fetch).exists()

    if not items_exist:
        return MenuResponse(
            Menu=MenuDTO(categories=[
                CategoryResponse(
                    id=str(category.id),
                    index=category.index,
                    menu_items=category.menu_items,
                    name=category.name
                ) for category in categories
            ],),
            Items={}
        )

    menu_items = await MenuItem.find(Category.id in items_to_fetch).to_list()
    return MenuResponse(
        Menu=MenuDTO(categories=[
            CategoryResponse(
                **category.model_dump(),
                id=str(category.id),
            ) for category in categories
        ]),
        Items={str(menu_item.id): MenuItemResponse(
            **menu_item.model_dump(), id=str(menu_item.id)) for menu_item in menu_items}
    )


@router.get("")
async def getMenu(user=Depends(current_user)):
    categories = await Category.all().sort("+index").to_list()
    return await generateMenu(categories)


class ChangeOrderRequest(BaseModel):
    order: List[str]


@router.put("/reorder")
async def reorderMenu(req: ChangeOrderRequest, manager=Depends(manager_user)) -> MenuResponse:
    # Check that all the ids are real

    categories = await Category.all().to_list()
    if len(categories) != len(req.order):
        raise HTTPException(
            status_code=400, detail="Request must include a list of all category ids in the wanted order.")

    all_given_categories_exist = all(
        [str(category.id) in req.order for category in categories])
    if not all_given_categories_exist:
        raise HTTPException(
            status_code=400, detail="One or more of the given category ids do not exist.")

    # Reorder the categories according to the given id list.
    for (index, categoryId) in enumerate(req.order):
        category = next(filter(lambda x: str(x.id) == categoryId, categories))
        category.index = index

    for category in categories:
        await category.save()
    categories = sorted(categories, key=lambda x: x.index)

    return await generateMenu(categories)
