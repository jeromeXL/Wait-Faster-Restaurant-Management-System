from httpx import AsyncClient
import pytest
import pytest_asyncio
from utils.password import hash_password
from router.category import CategoryResponse
from router.menu import MenuResponse
from models.category import Category
from config import CONFIG
from models.user import User, UserRole
from tests.integration.client import get_client


@pytest_asyncio.fixture()
async def manager_client():

    # This fixture will run before and all tests it is registered on
    # TODO: Update this to login as a manger instead of an admin when manager creation exists.
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

        CategoryList = await Category.find_all().to_list()
        for category in CategoryList:
            await category.delete()
        yield client
        # Dispose of client


@pytest.mark.asyncio
async def test_get_empty_menu(manager_client: AsyncClient):
    response = await manager_client.get("/menu")
    assert response.status_code == 200

    menuResponse = MenuResponse.model_validate(response.json())
    assert len(menuResponse.Items) == 0
    assert len(menuResponse.Menu.categories) == 0


@pytest.mark.asyncio
async def test_get_menu_with_single_category(manager_client: AsyncClient):

    # Create a category
    response = await manager_client.post(
        "/category/", json={"name": "Stub name", "menu_items": []}
    )
    assert response.status_code == 200

    response = await manager_client.get("/menu")
    assert response.status_code == 200

    menuResponse = MenuResponse.model_validate(response.json())
    assert len(menuResponse.Items) == 0
    assert len(menuResponse.Menu.categories) == 1
    assert menuResponse.Menu.categories[0].name == "Stub name"


@pytest.mark.asyncio
async def test_get_menu_with_multiple_categories(manager_client: AsyncClient):

    # Create a category
    response = await manager_client.post(
        "/category/", json={"name": "Stub name", "menu_items": []}
    )
    assert response.status_code == 200
    category_one = CategoryResponse.model_validate(response.json())

    # Create a category
    response = await manager_client.post(
        "/category/", json={"name": "Stub name 2", "menu_items": []}
    )
    assert response.status_code == 200
    category_two = CategoryResponse.model_validate(response.json())

    # Get the menu
    response = await manager_client.get("/menu")
    assert response.status_code == 200

    menuResponse = MenuResponse.model_validate(response.json())
    assert len(menuResponse.Items) == 0
    assert len(menuResponse.Menu.categories) == 2
    assert menuResponse.Menu.categories[0].name == "Stub name"
    assert menuResponse.Menu.categories[0].index == 0
    assert menuResponse.Menu.categories[1].name == "Stub name 2"
    assert menuResponse.Menu.categories[1].index == 1

    # Reorder
    response = await manager_client.put(
        "/menu/reorder",
        json={
            "order": [category_two.id, category_one.id],
            "name": "test",
            "menu_items": [],
        },
    )
    assert response.status_code == 200
    menuResponse = MenuResponse.model_validate(response.json())

    assert len(menuResponse.Items) == 0
    assert len(menuResponse.Menu.categories) == 2
    assert menuResponse.Menu.categories[0].name == "Stub name 2"
    assert menuResponse.Menu.categories[0].index == 0
    assert menuResponse.Menu.categories[1].name == "Stub name"
    assert menuResponse.Menu.categories[1].index == 1
