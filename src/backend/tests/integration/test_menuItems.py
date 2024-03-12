import pytest
import pytest_asyncio
from config import CONFIG
from models.user import User, UserRole
from tests.integration.client import get_client
from models.menuItem import MenuItem

## Intended to be tested with a fresh database.
# Test Creating a Menun Item

@pytest_asyncio.fixture() 
async def manager_client():

	# This fixture will run before and all tests it is registered on
	# TODO: Update this to login as a manger instead of an admin when manager creation exists.
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
async def test_create_menu_item(manager_client):

	# Create a new menu item
	response = await manager_client.post("/menu-item/", json={
		"name": "Test Item",
		"price": 10.99,
		"dietary_details": ["Vegetarian"],
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
async def test_update_menu_item(manager_client):


	# Update an existing menu item
	response = await manager_client.post("/menu-item/", json={
		"name": "Test Item",
		"price": 10.99,
		"dietary_details": ["Vegetarian"],
		"description": "This is a test menu item."
	})
	menu_item = response.json()

	update_response = await manager_client.put(f"/menu-item/{menu_item['id']}", json={
		"price": 12.99,
		"description": "Updated description."
	})
	assert update_response.status_code == 200
	updated_menu_item = update_response.json()
	assert updated_menu_item["price"] == 12.99
	assert updated_menu_item["description"] == "Updated description."

# Test Deleting a Menu Item
@pytest.mark.asyncio
async def test_delete_menu_item(manager_client):

	# Create a new menu item to delete
	response = await manager_client.post("/menu-item/", json={
		"name": "Test Item",
		"price": 10.99,
		"dietary_details": ["Vegetarian"],
		"description": "This is a test menu item."
	})
	menu_item = response.json()

	# Delete the menu item
	delete_response = await manager_client.delete(f"/menu-item/{menu_item['id']}")
	assert delete_response.status_code == 200
	assert delete_response.json() == {"message": "Menu item deleted successfully"}

