from datetime import datetime
from typing import Tuple
from httpx import AsyncClient
import pytest
from router.menuItem import CreateMenuItemRequest, MenuItemResponse
from models.session import Session, SessionStatus
from router.orders import (
    CreateOrderRequest,
    CreateOrderItemRequest,
    GetOrdersResponse,
    OrderResponse,
    OrderUpdateRequest,
)
from utils.password import hash_password
from tests.integration.client import get_client
from models.menuItem import MenuItem
from models.order import Order, OrderStatus
from config import CONFIG
import pytest_asyncio
from models.user import User, UserRole


@pytest_asyncio.fixture()
async def manager_client():

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
            username="manager", password=hash_password("manager"), role=UserRole.MANAGER
        )
        await managerUser.create()

        login_response = await client.post(
            "/auth/login", json={"username": "manager", "password": "manager"}
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        await MenuItem.delete_all()
        await Order.delete_all()
        yield client


@pytest_asyncio.fixture()
async def customer_tablet_client():

    async with await get_client() as client:

        # Create a tablet user
        tableUser = User(
            username="Table1",
            password=hash_password("Table1"),
            role=UserRole.CUSTOMER_TABLET,
        )
        await tableUser.create()

        session = Session(
            orders=[], status=SessionStatus.OPEN, session_start_time=datetime.now()
        )
        await session.create()

        login_response = await client.post(
            "/auth/login", json={"username": "Table1", "password": "Table1"}
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        yield (client, session)


@pytest.mark.asyncio
async def test_order_menu_items_valid(
    manager_client: AsyncClient, customer_tablet_client: Tuple[AsyncClient, Session]
):

    session_id = customer_tablet_client[1].id
    # Create a new menu item
    response = await manager_client.post(
        "/menu-item/",
        json=CreateMenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
        ).model_dump(),
    )
    assert response.status_code == 200
    menu_item = MenuItemResponse.model_validate(response.json())

    payload = CreateOrderRequest(
        session_id=str(session_id),
        items=[
            CreateOrderItemRequest(
                menu_item_id=menu_item.id,
                is_free=False,
                preferences=["extra cheese"],
                additional_notes="No onions",
            )
        ],
    )

    response = await customer_tablet_client[0].post("/order", json=payload.model_dump())
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_can_update_order_item_state(
    manager_client: AsyncClient, customer_tablet_client: Tuple[AsyncClient, Session]
):
    session_id = customer_tablet_client[1].id

    # Create a new menu item
    response = await manager_client.post(
        "/menu-item/",
        json=CreateMenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
        ).model_dump(),
    )
    assert response.status_code == 200
    menu_item = MenuItemResponse.model_validate(response.json())

    payload = CreateOrderRequest(
        session_id=str(session_id),
        items=[
            CreateOrderItemRequest(
                menu_item_id=menu_item.id,
                is_free=False,
                preferences=["extra cheese"],
                additional_notes="No onions",
            )
        ],
    )
    response = await customer_tablet_client[0].post("/order", json=payload.model_dump())

    assert response.status_code == 200
    order_response = OrderResponse.model_validate(response.json())
    status_update_payload = OrderUpdateRequest(status=OrderStatus.PREPARING)
    order_id = order_response.id
    item_id = order_response.items[0].menu_item_id

    # Format the URL string with the order_id and item_id variables
    url = f"/order/{order_id}/{item_id}"

    # Make the request using the formatted URL
    update_response = await manager_client.post(
        url, json=status_update_payload.model_dump()
    )

    print(update_response.json())
    assert update_response.status_code == 200


@pytest.mark.asyncio
async def test_get_orders_with_filters(
    manager_client: AsyncClient, customer_tablet_client: Tuple[AsyncClient, Session]
):

    session_id = customer_tablet_client[1].id

    # Create a new menu item
    response = await manager_client.post(
        "/menu-item/",
        json=CreateMenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
        ).model_dump(),
    )
    assert response.status_code == 200
    menu_item = MenuItemResponse.model_validate(response.json())

    payload = CreateOrderRequest(
        session_id=str(session_id),
        items=[
            CreateOrderItemRequest(
                menu_item_id=menu_item.id,
                is_free=False,
                preferences=["extra cheese"],
                additional_notes="No onions",
            )
        ],
    )
    response = await customer_tablet_client[0].post("/order", json=payload.model_dump())
    assert response.status_code == 200
    order_response = OrderResponse.model_validate(response.json())

    # Use the get orders request to validate the existence of the order.
    response = await manager_client.get("/orders")
    assert response.status_code == 200
    orders_response = GetOrdersResponse.model_validate(response.json())
    assert orders_response == GetOrdersResponse(orders=[order_response])

    # Perform another get request but filter for only pending orders.
    response = await manager_client.get("/orders?statuses=1")
    assert response.status_code == 200
    orders_response = GetOrdersResponse.model_validate(response.json())
    assert orders_response == GetOrdersResponse(orders=[])

    # Make the request using the formatted URL
    status_update_payload = OrderUpdateRequest(status=OrderStatus.PREPARING)
    order_id = order_response.id
    item_id = order_response.items[0].menu_item_id
    update_response = await manager_client.post(
        f"/order/{order_id}/{item_id}", json=status_update_payload.model_dump()
    )
    assert update_response.status_code == 200

    # Check the orders list again
    response = await manager_client.get("/orders")
    assert response.status_code == 200
    orders_response = GetOrdersResponse.model_validate(response.json())

    assert len(orders_response.orders) == 1
    order = orders_response.orders[0]
    assert order.status == OrderStatus.PREPARING

    assert len(order.items) == 1
    item = order.items[0]
    assert item.status == OrderStatus.PREPARING

    # Check the order list, but filter for preparing, and should see the item now
    response = await manager_client.get("/orders?statuses=1")
    assert response.status_code == 200
    orders_response = GetOrdersResponse.model_validate(response.json())

    assert len(orders_response.orders) == 1
    order = orders_response.orders[0]
    assert order.status == OrderStatus.PREPARING

    assert len(order.items) == 1
    item = order.items[0]
    assert item.status == OrderStatus.PREPARING
