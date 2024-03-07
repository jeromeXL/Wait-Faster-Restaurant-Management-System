from fastapi import APIRouter, Depends
from pydantic import BaseModel
from models.user import User, UserRole
#from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from utils.user_authentication import admin_user
from config import CONFIG
from models.user import User

#client = AsyncIOMotorClient("mongodb://localhost:27017/")
client = CONFIG.mongo_connection_string
db = client["restaurantdatabase"] 

router = APIRouter(prefix="/user", tags=["User"])

# Create User    
@router.post("/create")
async def createUser(user: User, adminUser = Depends(admin_user())) -> User.id:
    newUser = User(username=user.username, password=user.password, role=user.role)
    newUser.insert()
    return newUser.id

# Update User (Previously Update Password)
class UpdateRequest(BaseModel):
    newUsername: str
    newPassword: str
    newRole: UserRole
    
@router.patch("/update/{id}")
async def updateUser(id: str, updateRequest: UpdateRequest, adminUser = Depends(admin_user())) -> bool:
    if adminUser:
        user = await User.find_one(User.id == id)
        await user.set(updateRequest)

# Delete User
@router.delete("/delete/{id}")
async def deleteUser(id: str) -> bool:
    user = await User.find_one(User.id == id)
    await user.delete()

# Fetch all users (Helper)
#@router.get("/all")
#async def allUsers():
#    users = await User.find_all()
#    return users