import asyncio
from datetime import timedelta
from typing import List, Set
from beanie import PydanticObjectId

from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from utils.user_authentication import admin_user, manager_user
from models.auth import AccessToken, RefreshToken
from models.user import User
from models.category import Category
from utils.password import hash_password
from jwt import access_security, refresh_security
from bson.errors import InvalidId
# from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/category", tags=["Menu"])


class CategoryCreate(BaseModel):
    name: str
    menu_items: List[str]


class CategoryResponse(BaseModel):
    id: str
    name: str
    menu_items: List[str]
    index: int


@router.post("/", response_model=CategoryResponse)
async def createCategory(createRequest: CategoryCreate, manager=Depends(manager_user)) -> CategoryResponse:
    # Validate.
    if not createRequest.name.strip():
        raise HTTPException(
            status_code=400, detail="Category name cannot be empty")

    # find if it exists
    category = await Category.find_one(Category.name == createRequest.name)
    if category:
        raise HTTPException(
            status_code=400, detail="Category name cannot be duplicated")

    # Create the category, by first finding the current max index and adding one.
    largestIndex = await Category.all().max('index')
    if largestIndex is None:
        largestIndex = -1

    # Create new category object
    newCategory = Category(**createRequest.model_dump(),
                           index=int(largestIndex) + 1)

    await newCategory.create()
    return CategoryResponse(**newCategory.model_dump())


@router.put("/{categoryId}", response_model=CategoryResponse)
async def updateCategory(categoryId: str, updatedCategory: CategoryCreate, manager=Depends(manager_user)):
    try:
        category = await Category.find_one(Category.id == PydanticObjectId(categoryId))
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        if category is None or not updatedCategory.name.strip():
            raise HTTPException(
                status_code=400, detail="Category name cannot be empty")

        # find if it exists
        conflictingCategory = await Category.find_one(Category.name == updatedCategory.name)
        if conflictingCategory is not None and conflictingCategory.id != PydanticObjectId(categoryId):
            raise HTTPException(
                status_code=400, detail="Category name cannot be duplicated")

        category.name = updatedCategory.name
        category.menu_items = updatedCategory.menu_items

        await category.save()
        return CategoryResponse(**category.model_dump())
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Id")


@router.delete("/{categoryId}")
async def deleteCategory(categoryId: str, manager=Depends(manager_user)):
    try:
        category = await Category.get(categoryId)
        await category.delete()
    except:
        raise HTTPException(status_code=404, detail="Category not found")
    print("deleted category with id: {categoryId}")
    # remove from menu.json also if it is there
    return {"message": "Category deleted successfully"}
