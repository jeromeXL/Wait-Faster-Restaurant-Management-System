from httpx import AsyncClient
import pytest
import pytest_asyncio
from backend.utils.password import hash_password
from tests.integration.client import get_client
from config import CONFIG
from models.user import  User, UserRole

@pytest_asyncio.fixture() #Fixture not working 
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
        
        ## Delete all users and create the default admin user.
        non_admin_users = await User.find(User.role != UserRole.USER_ADMIN).to_list()
        for user in non_admin_users:
            await user.delete()
        
        yield client 
        # Dispose of client

@pytest.mark.asyncio
async def test_get_users(admin_client: AsyncClient):
    users_response = await admin_client.get("/users")
    assert users_response.status_code == 200

    data = users_response.json()
    assert data[0]["username"] == "admin"
    assert data[0]['role'] == 1


@pytest.mark.asyncio 
async def test_create_user_success(admin_client): # Need to manually clear database on MongoDB compass to avoid 409 conflict error
    create_response = await admin_client.post("/user/create", json={
        "username": "Table1",
        "password": "initialpassword",
        "role": UserRole.CUSTOMER_TABLET.value 
    })
    assert create_response.status_code == 200
    assert create_response.json()["username"] == "Table1"
    assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value


@pytest.mark.asyncio
async def test_create_user_invalid_table_name(admin_client):
    create_response = await admin_client.post("/user/create", json={
        "username": "InvalidName",
        "password": "initialpassword",
        "role": UserRole.CUSTOMER_TABLET.value 
    })
    assert create_response.status_code == 422

'''
@pytest.mark.asyncio 
async def test_update_user_password(admin_client):

    create_response = await admin_client.post("/user/create", json={
        "username": "Table2",
        "password": "initialpassword",
        "role": UserRole.CUSTOMER_TABLET.value 
    })
    assert create_response.status_code == 200
    
    assert create_response.json()["username"] == "Table2"
    assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value
    hashedOldPassword = create_response.json()["password"]

    update_response = await admin_client.put(f"/user/update/{create_response.json()['id']}", json={
        "username": "Table2",
        "password": "newpassword",
        "role": UserRole.CUSTOMER_TABLET.value 
    })
    assert update_response.status_code == 200
    assert hashedOldPassword != update_response.json()["password"]


@pytest.mark.asyncio
async def test_delete_user(admin_client):
   
    create_response = await admin_client.post("/user/create", json={
        "username": "Table3",
        "password": "initialpassword",
        "role": UserRole.CUSTOMER_TABLET.value 
    })
    assert create_response.status_code == 200
    assert create_response.json()["username"] == "Table3"
    assert create_response.json()["role"] == UserRole.CUSTOMER_TABLET.value

    delete_response = await admin_client.delete(f"/user/delete/{create_response.json()['id']}")
    assert delete_response.status_code == 200
'''