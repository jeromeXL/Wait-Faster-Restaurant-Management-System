from httpx import AsyncClient
import pytest
import pytest_asyncio
from models.order import OrderStatus
from router.session import SessionResponse
from router.orders import (
    CreateOrderItemRequest,
    CreateOrderRequest,
    OrderResponse,
    OrderUpdateRequest,
)
from models.menuItem import MenuItem
from config import CONFIG
from models.category import Category
from models.user import User, UserRole
from utils.password import hash_password
from tests.integration.client import get_client


@pytest_asyncio.fixture()
async def setup_fixture():
    async with await get_client() as client:

        await User.delete_all()

        # Create the admin user
        adminUser = User(
            username=CONFIG.default_user_username,
            password=hash_password(CONFIG.default_user_password),
            role=UserRole.USER_ADMIN,
        )
        await adminUser.create()

        # Create a manager user
        managerUser = User(
            username="m", password=hash_password("m"), role=UserRole.MANAGER
        )
        await managerUser.create()

        # Create a wait staff user
        wait_staff_user = User(
            username="wait", password=hash_password("wait"), role=UserRole.WAIT_STAFF
        )
        await wait_staff_user.create()

        # Create multiple customers
        for i in range(1, 11):
            customer = User(
                username=f"Table{i}",
                password=hash_password("t"),
                role=UserRole.CUSTOMER_TABLET,
            )
            await customer.create()

        await Category.delete_all()
        await MenuItem.delete_all()
        # Create a food item
        menu_item = MenuItem(
            name="Hamburger",
            price=10.99,
            health_requirements=[],
            description="Contains Meat",
        )
        await menu_item.create()

        yield (menu_item)
        # Dispose of client


@pytest_asyncio.fixture()
async def manager_client(setup_fixture):

    async with await get_client() as client:

        login_response = await client.post(
            "/auth/login", json={"username": "m", "password": "m"}
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        yield client
        # Dispose of client


@pytest.mark.asyncio
async def test_multiple_customers_seed(
    manager_client: AsyncClient, setup_fixture: MenuItem
):

    async with await get_client() as client:

        ### log in as table 2, and start a session. ###
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table2",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.id),
                    is_free=False,
                    preferences=["extra cheese"],
                    additional_notes="No onions",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200

        ### Login as another user, create the same order but update the state. ###
        # log in as table 1, and start a session.
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table1",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.id),
                    is_free=False,
                    preferences=["extra cheese"],
                    additional_notes="No onions",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
        )
        assert response.status_code == 200

        # Login as another user, create the same order but update the state.
        # log in as table 3, and start a session.
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table3",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.id),
                    is_free=False,
                    preferences=["extra cheese"],
                    additional_notes="No onions",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.id),
                    is_free=False,
                    preferences=["extra cheese"],
                    additional_notes="No onions",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
        )
        print(response.json())
        assert response.status_code == 200

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.COMPLETE).model_dump(),
        )
        assert response.status_code == 200
