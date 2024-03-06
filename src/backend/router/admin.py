from fastapi import APIRouter
from models.user import User, UserRole
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

client = AsyncIOMotorClient("mongodb://localhost:27017/")
db = client["restaurantdatabase"] 

router = APIRouter(prefix="/user", tags=["User"])

# Create User
@router.post("/")
async def createUser(userCreator: User, username: str, password: str, role: int) -> User:

    


# Update Password
@router.post("/{username}")
async def updatePassword(newPassword: str) -> bool:
    user = await User.find_one(User.username == username)
    await user.set({User.password: newPassword})

# Delete User
@router.post("/{username}")
async def deleteUser() -> bool:
    user = await User.find_one(User.username == username)
    await user.delete()
