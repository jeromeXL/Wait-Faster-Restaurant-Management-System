from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from utils.user_authentication import admin_user
from models.auth import AccessToken, RefreshToken
from models.user import User
from models.menu import Category
from utils.password import hash_password
from jwt import access_security, refresh_security
from bson.objectid import ObjectId
# from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/category", tags=["Menu"])

class CategoryCreate(BaseModel):
    name: str
    menuItem: List[str]
    index: int = -1

class CategoryResponse(BaseModel):
    id: str
    name: str
    menuItem: List[str]
    index: int

class CategoryUpdate(BaseModel):
    id: str
    name: str
    menuItem: List[str]
    index: int = -1

@router.post("/new", response_model=CategoryResponse)
async def createCategory( newCategory: CategoryCreate, manager = Depends(admin_user)):
    # create a new category
    vCategory = Category.model_validate(newCategory.model_dump())
    if not vCategory.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    # find if it exists
    category = await Category.find_one(Category.name == vCategory.name)
    if category:
        raise HTTPException(status_code=400, detail="Category name cannot be duplicated")
    newCategory = Category(**newCategory.model_dump())
    await newCategory.create()
    return CategoryResponse(**newCategory.model_dump())

@router.put("/{categoryId}", response_model=CategoryResponse)
async def updateCategory(categoryId: str, updatedCategory: CategoryCreate, manager = Depends(admin_user)):
    # vUpdateCategory = Category.model_validate(updatedCategory.model_dump())
    # category = Category.get_by_id(categoryId)
    # category = Category.find_one(Category.id == categoryId)
    try:
        category = await Category.get(categoryId)
    except:
        raise HTTPException(status_code=404, detail="Category not found")

    if not updatedCategory.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    category.name = updatedCategory.name
    category.menuItem = updatedCategory.menuItem
    category.index = updatedCategory.index

    return CategoryResponse(**category.model_dump())

@router.delete("/{categoryId}")
async def deleteCategory(categoryId: str, manager = Depends(admin_user)):
    # category = Category.get_by_id(categoryId)
    # category = Category.find_one(Category.id==categoryId)
    # category = Category.find_one({"_id": categoryId})
    try:
        category = await Category.get(categoryId)
        await category.delete()
    except:
        raise HTTPException(status_code=404, detail="Category not found")
    print("deleted category with id: {categoryId}")
    # remove from menu.json also if it is there
    return {"message": "Category deleted successfully"}

@router.put("/reorder")
async def reorderMenu(changedMenu: List[str], manager = Depends(admin_user)):
# for each category name in changedMenu, assign the index that
# the category appears in in changedMenu: 0,1,2... etc
#   throw when non-existent category is in changedMenu
    return {"message": "Reorder"}

# debug helpers

@router.get("/all")
async def createCategory():
    async for result in Category.find():
    # async for result in Category.find().project(CategoryResponse).to_list():
        print(result)
    categorycount = await Category.count()
    print(f"There are {categorycount} categories ")
    return {"count" : categorycount}