from httpx import AsyncClient
import pytest
from utils.password import hash_password
from tests.integration.client import get_client
from models.menuItem import MenuItem
from models.order import OrderStatus, serialize_order_status
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

        login_response = await client.post(
            "/auth/login", json={"username": "Table1", "password": "Table1"}
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        yield client


@pytest.mark.asyncio
async def test_order_menu_items_valid(
    manager_client: AsyncClient, customer_tablet_client: AsyncClient
):

    # Create a new menu item
    response = await manager_client.post(
        "/menu-item/",
        json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item.",
        },
    )
    assert response.status_code == 200
    menu_item = response.json()
    assert "id" in menu_item
    assert menu_item["name"] == "Test Item"
    assert menu_item["price"] == 10.99
    assert menu_item["health_requirements"] == ["Vegetarian"]
    assert menu_item["description"] == "This is a test menu item."

    payload = {
        "status": serialize_order_status(OrderStatus.ORDERED),
        "session_id": "valid_session_id",
        "items": [
            {
                "status": serialize_order_status(OrderStatus.ORDERED),
                "menu_item_id": "valid_menu_item_id",
                "is_free": False,
                "preferences": ["extra cheese"],
                "additional_notes": "No onions",
            }
        ],
    }

    response = await customer_tablet_client.post("/order", json=payload)
    assert response.status_code == 200


# Test Updating Menu Items
@pytest.mark.asyncio
async def test_update_menu_item(manager_client: AsyncClient):

    # Update an existing menu item
    response = await manager_client.post(
        "/menu-item/",
        json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item.",
        },
    )
    menu_item = response.json()
    print(menu_item)

    update_response = await manager_client.put(
        f"/menu-item/{menu_item['id']}",
        json={
            "name": "Test Item 2",
            "price": 12.99,
            "health_requirements": ["Chicken"],
            "description": "Updated description.",
        },
    )
    assert update_response.status_code == 200
    updated_menu_item = update_response.json()
    assert updated_menu_item["price"] == 12.99
    assert updated_menu_item["description"] == "Updated description."


# Test Deleting a Menu Item
@pytest.mark.asyncio
async def test_delete_menu_item(manager_client):

    # Create a new menu item to delete
    response = await manager_client.post(
        "/menu-item/",
        json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item.",
        },
    )
    menu_item = response.json()

    # Delete the menu item
    delete_response = await manager_client.delete(f"/menu-item/{menu_item['id']}")
    response = await manager_client.get("/menu-items")
    assert response.status_code == 200
