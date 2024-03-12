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

@router.post("/{categoryId}")
async def createCategory(categoryId:str, newCategory: Category):
    # create a new category
    # if exists, abort creation
    # if invalid, abort
    # category = Category.objects.find_One(id=categoryId)
    category = Category.get_by_id(categoryId)
    if not category:
        # Validation checks
        vCategory = Category.validate(newCategory, category.model_dump())
        if not vCategory.name.strip():
            raise HTTPException(status_code=400, detail="Category name cannot be empty")
        newCategory = Category(**newCategory.category.model_dump())
    else:
        raise HTTPException(status_code=405, detail="Category with categoryId already exists")

@router.put("/{categoryId}")
async def updateCategory(categoryId: str, updatedCategory: Category):
    vUpdateCategory = Category.validate(updatedCategory.model_dump())
    category = Category.get_by_id(categoryId)
    # Validation check
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not vUpdateCategory.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    await category.update(**updatedCategory.model_dump())


@router.delete("/{categoryId}")
async def deleteCategory(categoryId: str):
    category = Category.get_by_id(categoryId)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await category.delete()
    # remove from menu.json also if it is there
    return {"message": "Category deleted successfully"}