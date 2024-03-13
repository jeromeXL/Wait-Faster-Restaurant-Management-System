import json
import os.path
from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from utils.user_authentication import admin_user
from models.auth import AccessToken, RefreshToken
from models.user import User
# from models.menu import Category
from utils.password import hash_password
from jwt import access_security, refresh_security
# from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("")
async def getMenu():
    # form the menu based on the categories listed in the menu.json file
    # make sure each category exists in database

    json_file = open(os.path.dirname(__file__) + '/../menu.json')
    # with open('menu.json', 'r') as f:
    data = json.load(json_file)
    return data