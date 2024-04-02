import pytest
import pytest_asyncio
from httpx import AsyncClient
from tests.integration.client import get_client
from config import CONFIG
from models.user import User, UserRole
from utils.password import hash_password
from main import app
from models.session import Session, SessionStatus

import pytest
from tests.integration.client import get_client
from models.menuItem import MenuItem
from models.order import OrderStatus, serialise_order_status
from config import CONFIG
import pytest_asyncio
from models.user import User, UserRole

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

        create_wait_staff_response = await client.post("/user/create", json={
            "username": "Staff1",
            "password": "Staff1",
            "role":  UserRole.WAIT_STAFF.value
        })
        assert create_wait_staff_response.status_code == 200


        yield client

@pytest_asyncio.fixture()
async def waitstaff_client():
    async with await get_client() as client:
        login_response = await client.post("/auth/login", json={
            "username": "Staff1",
            "password": "Staff1"
        })

        assert login_response.status_code == 200

        yield client


# @pytest.mark.asyncio
# async def test_get_Activity_Panel(admin_client: AsyncClient):
#     login_response = await admin_client.post("/auth/login", json={
#         "username": "Staff1",
#         "password": "Staff1"
#     })

#     panel_response = await admin_client.get("/Panel")
#     assert False


@pytest.mark.asyncio
async def test_Activity_Panel(admin_client: AsyncClient, waitstaff_client: AsyncClient):
    async with await get_client() as client:
        # Create a new menu item
        response = await client.post("/menu-item/", json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item."
        })
        payload = {
            "status": serialise_order_status(OrderStatus.ORDERED),
            "session_id": "valid_session_id",
            "items": [
                {
                    "status": serialise_order_status(OrderStatus.ORDERED),
                    "menu_item_id": "valid_menu_item_id",
                    "isFree": False,
                    "preferences": ["extra cheese"],
                    "additional_notes": "No onions"
                }
            ]
        }
        response = await client.post("/order", json=payload)
        print(response)
        # assert response.status_code == 200
        # status_update_payload = {
        #     "status": serialise_order_status(OrderStatus.PREPARING)
        # }
        # order_response = response.json()
        # order_id = order_response['id']
        # item_id = order_response['items'][0]['menu_item_id']

        # # Format the URL string with the order_id and item_id variables
        # url = f"/order/{order_id}/{item_id}"

        # # Make the request using the formatted URL
        # update_response = await client.post(url, json=status_update_payload)

        # print(update_response.json())
        # assert update_response.status_code == 200

    panel_response = await waitstaff_client.get("/Panel")
    # TODO
    # add various checks for order
    # check for order showing as being prepped,
    # and table as being in session
    assert panel_response.status_code == 200
