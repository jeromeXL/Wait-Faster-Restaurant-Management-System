from asgi_lifespan import LifespanManager
from httpx import AsyncClient
from main import app

async def get_client():
	async with LifespanManager(app) as manager:
		return AsyncClient(app=app, base_url="http://127.0.0.1:8000")