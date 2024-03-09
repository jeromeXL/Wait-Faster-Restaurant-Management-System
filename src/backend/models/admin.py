from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio  
from user import User, UserRole

client = AsyncIOMotorClient("mongodb://localhost:27017/")
db = client["restaurantDatabase"] 


async def main():
    await init_beanie(database=db, document_models=[User])
    
    new_user = User(username='Table12', password='initialPassword', role=5)
    await new_user.insert()

    # Find a user by username
    #user = await User.find_one(User.username == 'Table6')

    # Update the user's password
    #await user.set({User.password: 'newPassword'})

    # Delete the user               
    #await user.delete()

if __name__ == "__main__":
    asyncio.run(main())
