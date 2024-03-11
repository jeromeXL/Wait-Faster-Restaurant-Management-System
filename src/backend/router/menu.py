from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from utils.user_authentication import admin_user
from models.auth import AccessToken, RefreshToken
from models.user import User
from utils.password import hash_password
from jwt import access_security, refresh_security
from fastapi_jwt import JwtAuthorizationCredentials
from models.MenuObject import Menu

router = APIRouter(prefix="/Menu", tags=["Menu"])

@router.get("")
async def getMenu():
    # return await Menu.find_all()
    menu = Menu.find_all()
    if not menu:
        # impossible? fatal error?
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu

@router.put("")
async def updateMenu(changedMenu: Menu):
    # return await Menu.find_all()
    validated_menu = Menu.validate(changedMenu.model_dump())
    menu = Menu.find_all()
    if not menu:
        # impossible? fatal error?
        raise HTTPException(status_code=404, detail="Menu not found")
    await menu.update(**changedMenu.model_dump(exclude_unset=True))
    return menu