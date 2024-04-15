from contextlib import asynccontextmanager
from typing import Union, List
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import socketio
from models.menuItem import MenuItem
from models.user import User, UserRole
from models.category import Category
from router.auth import router as AuthRouter
from router.menu import router as MenuRouter
from router.menuItem import router as MenuItemRouter
from router.category import router as CategoryRouter
from router.admin import router as AdminRouter
from router.orders import router as OrderRouter
from router.activityPanel import router as ActivityPanelRouter
from router.assistanceRequests import router as AssistanceRequestsRouter
from utils.password import hash_password
from config import CONFIG
from starlette.middleware.cors import CORSMiddleware
from router.session import router as SessionRouter
from models.order import OrderItem, Order
from models.session import Session
from socket_io import sio


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize application services."""

    # Init beanie with the Product document class
    # type: ignore[attr-defined]
    app.db = AsyncIOMotorClient(CONFIG.mongo_connection_string).account

    await init_beanie(
        app.db,
        document_models=[
            User,
            MenuItem,
            Category,
            Order,
            Session,
        ],
    )  # type: ignore[arg-type,attr-defined
    # Check if the database has 0 users. If it does, then create a base admin user.
    userCount = await User.count()
    print(f"There are {userCount} user(s) in the database.")
    if userCount == 0:
        print(
            "There are no users in the database. Creating seed user with credentials: admin admin"
        )
        adminUser = User(
            username="admin", password=hash_password("admin"), role=UserRole.USER_ADMIN
        )
        await adminUser.create()

    print("Startup complete")
    yield
    print("Shutdown complete")


app = FastAPI(
    title="Wait Faster API",
    description="The api for the wait faster application.",
    version="0.1.0",
    # Registers the 'lifespan' function to run at startup and shutdown. It stores a reference to the database, so that models can access them during api calls.
    lifespan=lifespan,
)

app.include_router(AuthRouter)
app.include_router(AdminRouter)
app.include_router(MenuRouter)
app.include_router(CategoryRouter)
app.include_router(MenuItemRouter)
app.include_router(SessionRouter)
app.include_router(OrderRouter)
app.include_router(ActivityPanelRouter)
app.include_router(AssistanceRequestsRouter)

cors = CONFIG.cors.split(",")
print(cors)

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def health_check():
    return "HEALTHY"


socket_app = socketio.ASGIApp(sio)
app.mount("/", socket_app)


@sio.event()
def connect(sid, environ, auth):
    pass


@sio.event()
def disconnect(sid):
    pass
