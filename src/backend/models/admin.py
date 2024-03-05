from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from enum import Enum

client = AsyncIOMotorClient("mongodb://localhost:27017/")
db = client["restaurantdatabase"] 

class UserRole(Enum):
	USER_ADMIN = 1
	MANAGER = 2
	WAIT_STAFF = 3
	KITCHEN_STAFF = 4
	CUSTOMER_TABLET = 5

class User(Document):
	username: str
	password: str
	role: UserRole

async def main():
    await init_beanie(database=db, document_models=[User])
    
    new_user = User(username='Table1', password='initialPassword', role=5)
    await new_user.insert()

    # Find a user by username
    user = await User.find_one(User.username == 'Table1')

    # Update the user's password
    await user.set({User.password: 'newPassword'})

    # Delete the user
    # await user.delete()

if __name__ == "__main__":
    asyncio.run(main())
