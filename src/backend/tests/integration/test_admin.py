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
        yield client 

@pytest.mark.asyncio
async def test_admin_can_get_users():
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
        response2 = await client.get("/users")
        assert response2.status_code == 200

'''
@pytest.mark.asyncio 
async def test_create_user_success(admin_client):
    
        response2 = await admin_client.post("/user/create", json={
            "username": "Table1",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert response2.status_code == 200
        assert response2.json()["username"] == "Table1"
        assert response2.json()["password"] == "initialpassword"
        assert response2.json()["role"] == UserRole.CUSTOMER_TABLET.value
'''


'''
@pytest.mark.asyncio
async def test_create_user_invalid_table_name():
    async with await get_client() as client:
        response = await client.post("/user/create", json={
            "username": "InvalidName",
            "password": "initialpassword",
            "role": UserRole.CUSTOMER_TABLET.value 
        })
        assert response.status_code == 422
'''
#@pytest.mark.asyncio
#async def test_admin_can_update_user():


#@pytest.mark.asyncio
#async def test_admin_can_delete_user():

