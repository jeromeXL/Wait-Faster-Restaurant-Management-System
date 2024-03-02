from contextlib import asynccontextmanager
from typing import Union
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.user import User, UserRole
from router.auth import router as AuthRouter
from utils.password import hash_password

@asynccontextmanager
async def lifespan(app: FastAPI):  
    
    """Initialize application services."""
    
    # Init beanie with the Product document class
    app.db = AsyncIOMotorClient("mongodb://127.0.0.1:27017").account  # type: ignore[attr-defined]
    await init_beanie(app.db, document_models=[User])  # type: ignore[arg-type,attr-defined]
    
    # Check if the database has 0 users. If it does, then create a base admin user.
    userCount = await User.count()
    print(f"There are {userCount} user(s) in the database.")
    if (userCount == 0):
        print("There are no users in the database. Creating seed user with credentials: admin admin")
        adminUser = User(username="admin",password=hash_password("admin"), role=UserRole.USER_ADMIN)
        await adminUser.create()

    print("Startup complete")
    yield
    print("Shutdown complete")

app = FastAPI(
    title="Wait Faster API",
    description="The api for the wait faster application.",
    version="0.1.0",
    lifespan=lifespan, # Registers the 'lifespan' function to run at startup and shutdown. It stores a reference to the database, so that models can access them during api calls.
)

app.include_router(AuthRouter)

## Sample routes.
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

