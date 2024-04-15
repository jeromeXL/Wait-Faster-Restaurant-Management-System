import pytest
import pytest_asyncio
from httpx import AsyncClient
from router.activityPanel import ActivityPanelResponse, TableActivityResponse
from router.orders import (
    CreateOrderItemRequest,
    CreateOrderRequest,
    GetOrdersResponse,
    OrderResponse,
)
from models.menuItem import MenuItem
from router.menuItem import MenuItemRequest, MenuItemResponse
from models.order import OrderStatus
from router.session import SessionResponse
from tests.integration.client import get_client
from config import CONFIG
from models.user import User, UserRole
from utils.password import hash_password
from models.session import Session
import pytest
from tests.integration.client import get_client
from config import CONFIG
import pytest_asyncio
from models.user import User, UserRole


# setup users
@pytest_asyncio.fixture()
async def admin_client():
    async with await get_client() as client:

        await User.delete_all()
        await Session.delete_all()

        adminUser = User(
            username=CONFIG.default_user_username,
            password=hash_password(CONFIG.default_user_password),
            role=UserRole.USER_ADMIN,
        )
        await adminUser.create()

        login_response = await client.post(
            "/auth/login",
            json={
                "username": CONFIG.default_user_username,
                "password": CONFIG.default_user_password,
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_customer_tablet_response = await client.post(
            "/user/create",
            json={
                "username": "Table1",
                "password": "Table1",
                "role": UserRole.CUSTOMER_TABLET.value,
            },
        )
        assert create_customer_tablet_response.status_code == 200

        create_wait_staff_response = await client.post(
            "/user/create",
            json={
                "username": "Manager1",
                "password": "Manager1",
                "role": UserRole.MANAGER.value,
            },
        )
        assert create_wait_staff_response.status_code == 200

        yield client


@pytest_asyncio.fixture()
async def manager_client():
    async with await get_client() as client:
        login_response = await client.post(
            "/auth/login", json={"username": "Manager1", "password": "Manager1"}
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        yield client


@pytest_asyncio.fixture()
async def customer_table_client():
    async with await get_client() as client:
        login_response = await client.post(
            "/auth/login", json={"username": "Table1", "password": "Table1"}
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Start a session for this customer
        start_response = await client.post("/session/start")
        assert start_response.status_code == 200
        yield client


@pytest_asyncio.fixture()
async def session(customer_table_client: AsyncClient) -> SessionResponse:
    response = await customer_table_client.get("/table/session")
    assert response.status_code == 200
    return SessionResponse.model_validate(response.json())


@pytest.mark.asyncio
async def test_activity_panel_returns_correct_users(
    admin_client: AsyncClient,
    manager_client: AsyncClient,
    customer_table_client: AsyncClient,
    session: SessionResponse,
):

    # Create a new menu item
    response = await manager_client.put(
        "/menu-item/",
        json=MenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
            ingredients=["testing"]
        ).model_dump(),
    )
    menu_item = MenuItem.model_validate(response.json())
    payload = CreateOrderRequest(
        session_id=session.id,
        items=[
            CreateOrderItemRequest(
                menu_item_id=str(menu_item.id),
                is_free=False,
                preferences=["extra cheese"],
                additional_notes="No onions",
            )
        ],
    )
    response = await customer_table_client.post("/order", json=payload.model_dump())
    assert response.status_code == 200
    order_response = OrderResponse.model_validate(response.json())

    # Get Activity Panel response
    response = await manager_client.get("/activity")
    assert response.status_code == 200
    activity_panel_response = ActivityPanelResponse.model_validate(
        response.json())
    assert activity_panel_response == ActivityPanelResponse(
        tables=[
            TableActivityResponse(
                table_number=1,
                current_session=SessionResponse(
                    id=str(session.id),
                    status=session.status,
                    orders=[order_response],
                    session_start_time=session.session_start_time,
                    session_end_time=session.session_end_time,
                ),
            )
        ]
    )
