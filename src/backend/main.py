from contextlib import asynccontextmanager
from typing import Union, List
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.user import User, UserRole
from models.menu import Category
from router.auth import router as AuthRouter
from router.menu import router as MenuRouter
from router.category import router as CategoryRouter
from utils.password import hash_password
from config import CONFIG
from starlette.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):

    """Initialize application services."""

    # Init beanie with the Product document class
    app.db = AsyncIOMotorClient(CONFIG.mongo_connection_string).account  # type: ignore[attr-defined]
    await init_beanie(app.db, document_models=[User, Category])  # type: ignore[arg-type,attr-defined

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
app.include_router(MenuRouter)
app.include_router(CategoryRouter)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

## Sample routes.
@app.get("/")
def health_check():
    return "HEALTHY"

