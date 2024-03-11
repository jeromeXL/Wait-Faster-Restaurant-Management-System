import pytest
from tests.integration.client import get_client
from config import CONFIG
from models.user import  User, UserRole

@pytest.fixture #Fixture not working 
async def admin_client():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }
        return client 

@pytest.mark.asyncio
async def test_get_users():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        users_response = await client.get("/users")
        assert users_response.status_code == 200

        data = users_response.json()
        assert data[0]["username"] == "admin"
        assert data[0]['role'] == 1


@pytest.mark.asyncio 
async def test_create_user_success(): # Need to manually clear database on MongoDB compass to avoid 409 conflict error
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        create_response = await client.post("/user/create", json={
            "username": "Table1",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert create_response.status_code == 200
        assert create_response.json()["username"] == "Table1"
        assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value


@pytest.mark.asyncio
async def test_create_user_invalid_table_name():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        create_response = await client.post("/user/create", json={
            "username": "InvalidName",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert create_response.status_code == 422


@pytest.mark.asyncio 
async def test_update_user_password():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        create_response = await client.post("/user/create", json={
            "username": "Table2",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert create_response.status_code == 200
        assert create_response.json()["username"] == "Table2"
        assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value
        hashedOldPassword = create_response.json()["password"]

        update_response = await client.put("/user/update/Table2", json={
            "username": "Table2",
            "password": "newpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert update_response.status_code == 200
        assert hashedOldPassword != update_response.json()["password"]


@pytest.mark.asyncio
async def test_delete_user():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username" : CONFIG.default_user_username,
            "password" : CONFIG.default_user_password
        })
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {
            "Authorization": f"Bearer {tokens['access_token']}"
        }

        create_response = await client.post("/user/create", json={
            "username": "Table3",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert create_response.status_code == 200
        assert create_response.json()["username"] == "Table3"
        assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value

        delete_response = await client.delete("/user/delete/Table3")
        assert delete_response.status_code == 200