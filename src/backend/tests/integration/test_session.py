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

@pytest.mark.asyncio
async def test_admin_cant_start_session(admin_client):
    session_response = await admin_client.post("/session/start")
    assert session_response.status_code == 401

@pytest.mark.asyncio
async def test_session_not_created_upon_user_create(admin_client: AsyncClient):
    users_response = await admin_client.get("/users")
    assert users_response.status_code == 200

    data = users_response.json()
    if data[1]["username"] == "Table1":
        assert data[1]['active_session'] is None
    elif data[0]["username"] == "Table1":
        assert data[0]['active_session'] is None

@pytest.mark.asyncio
async def test_active_session_already_exists(admin_client: AsyncClient):
    login_response = await admin_client.post("/auth/login", json={
        "username": "Table1",
        "password": "Table1"
    })

    assert login_response.status_code == 200
    tokens = login_response.json()

    create_session_response = await admin_client.post("/session/start", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert create_session_response.status_code == 200

    create_session_response2 = await admin_client.post("/session/start", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert create_session_response2.status_code == 409

@pytest.mark.asyncio
async def test_session_lock_and_get_table_session(admin_client: AsyncClient):

    login_response = await admin_client.post("/auth/login", json={
        "username": "Table1",
        "password": "Table1"
    })

    assert login_response.status_code == 200
    tokens = login_response.json()

    create_session_response = await admin_client.post("/session/start", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert create_session_response.status_code == 200
    
    lock_session_response = await admin_client.post("/session/lock", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert lock_session_response.status_code == 200
    
    get_table_session_response = await admin_client.get("/table/session", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert get_table_session_response.status_code == 200
    
    session_data = get_table_session_response.json()
    assert session_data['status'] == SessionStatus.AWAITING_PAYMENT.value

@pytest.mark.asyncio
async def test_session_complete(admin_client: AsyncClient):

    # 1. Login as Customer Table
    login_response_ct = await admin_client.post("/auth/login", json={
        "username": "Table1",
        "password": "Table1"
    })
    assert login_response_ct.status_code == 200
    tokens_ct = login_response_ct.json()
    
    # 2. Create Session as Customer Table
    create_session_response = await admin_client.post("/session/start", headers={"Authorization": f"Bearer {tokens_ct['access_token']}"})
    assert create_session_response.status_code == 200
    create_session_data = create_session_response.json()
    assert create_session_data['status'] == SessionStatus.OPEN.value

    # 3. Create Wait Staff as Admin
    create_waitstaff_response = await admin_client.post("/user/create", json={
        "username": "Waiter",
        "password": "Waiter",
        "role":  UserRole.WAIT_STAFF.value
    })
    assert create_waitstaff_response.status_code == 200

    # 4. Login as Wait Staff
    login_response_ws = await admin_client.post("/auth/login", json={
        "username": "Waiter",
        "password": "Waiter"
    })
    assert login_response_ws.status_code == 200
    tokens_ws = login_response_ws.json()

    # 5. Complete Session as Wait Staff
    complete_session_response = await admin_client.post("/session/complete/Table1", 
        headers={"Authorization": f"Bearer {tokens_ws['access_token']}"},
        json={"customer_table_name": "Table1"}
    )
    assert complete_session_response.status_code == 200
    complete_session_data = complete_session_response.json()
    assert complete_session_data['active_session'] == None
    assert complete_session_data['session_status'] == SessionStatus.CLOSED.value
