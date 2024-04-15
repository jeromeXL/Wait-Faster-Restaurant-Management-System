from httpx import AsyncClient
import pytest
from router.menuItem import MenuItemRequest, MenuItemResponse
from utils.password import hash_password
from tests.integration.client import get_client
from models.menuItem import MenuItem
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


@pytest.mark.asyncio
async def test_create_menu_item(manager_client: AsyncClient):

    # Create a new menu item
    response = await manager_client.put(
        "/menu-item/",
        json=MenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
            ingredients=["Testing", "A dash of testing"]
        ).model_dump(),
    )
    assert response.status_code == 200
    menu_item = MenuItemResponse.model_validate(response.json())
    assert menu_item.name == "Test Item"
    assert menu_item.price == 10.99
    assert menu_item.health_requirements == ["Vegetarian"]
    assert menu_item.description == "This is a test menu item."
    assert menu_item.ingredients == ["Testing", "A dash of testing"]


# Test Updating Menu Items
@pytest.mark.asyncio
async def test_update_menu_item(manager_client: AsyncClient):

    # Create item
    response = await manager_client.put(
        "/menu-item/",
        json=MenuItemRequest(
            name="Test Item",
            price=10.99,
            health_requirements=["Vegetarian"],
            description="This is a test menu item.",
            ingredients=["Testing"]
        ).model_dump(),
    )
    assert response.status_code == 200
    menu_item = MenuItemResponse.model_validate(response.json())

    # Update an existing menu item
    update_response = await manager_client.post(
        f"/menu-item/{menu_item.id}",
        json=MenuItemRequest(
            name="Test Item",
            price=12.99,
            health_requirements=["Chicken"],
            description="Updated description.",
            ingredients=["Updated Testing"]
        ).model_dump(),
    )
    assert update_response.status_code == 200
    updated_menu_item = MenuItemResponse.model_validate(update_response.json())
    assert updated_menu_item.price == 12.99
    assert updated_menu_item.description == "Updated description."


# Test Deleting a Menu Item
@pytest.mark.asyncio
async def test_delete_menu_item(manager_client: AsyncClient):

    # Create a new menu item to delete
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
    assert response.status_code == 200
    menu_item = response.json()

    # Delete the menu item
    delete_response = await manager_client.delete(f"/menu-item/{menu_item['id']}")
    assert delete_response.status_code == 200
