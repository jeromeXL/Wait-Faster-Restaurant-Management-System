import pytest
from tests.integration.client import get_client
from models.menuItem import MenuItem
from models.session import OrderStatus
from models.session import serialise_order_status
from config import CONFIG
import pytest_asyncio
from models.user import User, UserRole
## Intended to be tested with a fresh database.
# Test Creating a Menun Item

@pytest.mark.asyncio
async def test_order_menu_items_valid():
    async with await get_client() as client:
        response = await client.get("/order/health")
        assert response.status_code == 200
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
        print("MENU ITEM IS NOW CREATED")
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
        #response = await client.put("/order", json=payload)
        print("Sending Payload")
        response = await client.post("/order", json=payload)
        print(response)
        assert response.status_code == 200


'''# Test Updating Menu Items
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
        print(menu_item)

        update_response = await client.put(f"/menu-item/{menu_item['id']}", json={
            "name": "Test Item 2",
            "price": 12.99,
            "health_requirements": ["Chicken"],
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
        #assert delete_response.json() == {"message": "Menu item deleted successfully"}
        response = await client.get("/allMenuItems")
        assert response.status_code == 200

'''