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

@router.post("/new", response_model=CategoryResponse)
async def createCategory( newCategory: CategoryCreate):
    # create a new category
    vCategory = Category.model_validate(newCategory.model_dump())
    if not vCategory.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    # find if it exists
    category = await Category.find_one(name = vCategory.name)
    if category:
        raise HTTPException(status_code=400, detail="Category name cannot be duplicated")
    newCategory = Category(**newCategory.model_dump())
    await newCategory.create()
    return CategoryResponse(**newCategory.model_dump())

@router.put("/{categoryId}")
async def updateCategory(categoryId: str, updatedCategory: Category):
    vUpdateCategory = Category.model_validate(updatedCategory.model_dump())
    category = Category.get_by_id(categoryId)
    # Validation check
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not vUpdateCategory.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    await category.update(**updatedCategory.model_dump())

@router.delete("/one/{categoryId}")
async def deleteCategory(categoryId: str):
    # category = Category.get_by_id(categoryId)
    category = Category.find_one(Category.id==categoryId)
    print("delete category with id: {categoryId}")
    print(category.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    # await category.delete()
    # remove from menu.json also if it is there
    return {"message": "Category deleted successfully"}

@router.put("/reorder")
async def reorderMenu(changedMenu: List[str]):
# for each category name in changedMenu, assign the index that
# the category appears in in changedMenu: 0,1,2... etc
#   throw when non-existent category is in changedMenu
    return {"message": "Reorder"}

# debug / helper routes
@router.get("/count")
async def createCategory():
    # create a new category
    categorycount = await Category.count()
    print(f"There are {categorycount} categories ")
    return categorycount

@router.get("/all")
async def createCategory():
    async for result in Category.find():
    # async for result in Category.find().project(CategoryResponse).to_list():
        print(result)

@router.delete("/all}")
async def deleteCategory():
    await Category.delete()
    # async for result in Category.find():
    #     print(result)
    #     # await result.delete()
    return {"message": "All Category deleted successfully"}