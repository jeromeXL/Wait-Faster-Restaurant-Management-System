import pytest
from tests.integration.client import get_client
from models.menuItem import MenuItem

## Intended to be tested with a fresh database.
# Test Creating a Menun Item
@pytest.mark.asyncio
async def test_create_menu_item():

    async with await get_client() as client:
        # Create a new menu item
        response = await client.post("/menu-item/", json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item."
        })
        assert response.status_code == 200
        menu_item = response.json()
        assert "id" in menu_item
        assert menu_item["name"] == "Test Item"
        assert menu_item["price"] == 10.99
        assert menu_item["health_requirements"] == ["Vegetarian"]
        assert menu_item["description"] == "This is a test menu item."

# Test Updating Menu Items
@pytest.mark.asyncio
async def test_update_menu_item():

    async with await get_client() as client:
        # Update an existing menu item
        response = await client.post("/menu-item/", json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item."
        })
        menu_item = response.json()

        update_response = await client.put(f"/menu-item/{menu_item['id']}", json={
            "price": 12.99,
            "description": "Updated description."
        })
        assert update_response.status_code == 200
        updated_menu_item = update_response.json()
        assert updated_menu_item["price"] == 12.99
        assert updated_menu_item["description"] == "Updated description."

# Test Deleting a Menu Item
@pytest.mark.asyncio
async def test_delete_menu_item():

    async with await get_client() as client:
        # Create a new menu item to delete
        response = await client.post("/menu-item/", json={
            "name": "Test Item",
            "price": 10.99,
            "health_requirements": ["Vegetarian"],
            "description": "This is a test menu item."
        })
        menu_item = response.json()

        # Delete the menu item
        delete_response = await client.delete(f"/menu-item/{menu_item['id']}")
        assert delete_response.status_code == 200
        assert delete_response.json() == {"message": "Menu item deleted successfully"}

