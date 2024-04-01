import pytest
import pytest_asyncio
from httpx import AsyncClient
from tests.integration.client import get_client
from config import CONFIG
from models.user import User, UserRole
from utils.password import hash_password
from main import app
from models.session import Session, SessionStatus

@pytest_asyncio.fixture()
async def admin_client():
    async with await get_client() as client:

        await User.delete_all()
        await Session.delete_all()

        adminUser = User(username=CONFIG.default_user_username, password=hash_password(
            CONFIG.default_user_password), role=UserRole.USER_ADMIN)
        await adminUser.create()

        login_response = await client.post("/auth/login", json={
            "username": CONFIG.default_user_username,
            "password": CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        create_customer_tablet_response = await client.post("/user/create", json={
            "username": "Table1",
            "password": "Table1",
            "role":  UserRole.CUSTOMER_TABLET.value
        })
        assert create_customer_tablet_response.status_code == 200

        yield client
