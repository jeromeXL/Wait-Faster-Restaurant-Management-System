import pytest
import pytest_asyncio
from httpx import AsyncClient
from tests.integration.client import get_client
from config import CONFIG
from models.user import User, UserRole
from utils.password import hash_password
from main import app


@pytest_asyncio.fixture()
async def admin_client():
    async with await get_client() as client:

        # Delete all users except default admin user.
        await User.delete_all()

        # Create the admin user
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

        yield client

@pytest_asyncio.fixture()
async def customer_table_user(admin_client):
    create_response = await admin_client.post("/user/create", json={
        "username": "Table1",
        "password": "password",
        "role": UserRole.CUSTOMER_TABLET.value
    })
    assert create_response.status_code == 200
    assert create_response.json()["active_session"] is not None

    user_data = create_response.json() #user info from admin user/create

    login_response = await admin_client.post("/auth/login", json={
        "username": "Table1",
        "password": "password"
    })

    assert login_response.status_code == 200

    token_data = login_response.json() #access token and refresh token fields

    yield user_data, token_data 

@pytest.mark.asyncio
async def test_session_start(customer_table_user, admin_client):
    user_data, token_data = customer_table_user

    async with await get_client() as customer_table_client:
        customer_table_client.headers.update({
            "Authorization": f"Bearer: {token_data['access_token']}"
        })

        session_response = await customer_table_client.post("/session/start")

        assert session_response.status_code == 200


@pytest.mark.asyncio
async def test_admin_cant_start_session(admin_client):
    session_response = await admin_client.post("/session/start")

    assert session_response.status_code == 401
