from contextlib import asynccontextmanager
from typing import Union
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.models.user import User
from backend.router.auth import router as AuthRouter

@asynccontextmanager
async def lifespan(app: FastAPI):  
    
    """Initialize application services."""
    
	# Init beanie with the Product document class
    app.db = AsyncIOMotorClient(CONFIG.mongo_uri).account  # type: ignore[attr-defined]
    await init_beanie(app.db, document_models=[User])  # type: ignore[arg-type,attr-defined]
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

