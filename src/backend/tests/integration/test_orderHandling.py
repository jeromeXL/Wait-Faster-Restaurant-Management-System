import pytest
from tests.integration.client import get_client
from models.menuItem import MenuItem
from models.order import OrderStatus, serialise_order_status
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
        response = await client.post("/order", json=payload)
        print(response)
        assert response.status_code == 200
        status_update_payload = {
            "status": serialise_order_status(OrderStatus.PREPARING)
        }
        order_response = response.json()
        order_id = order_response['id']
        item_id = order_response['items'][0]['menu_item_id']

        # Format the URL string with the order_id and item_id variables
        url = f"/order/{order_id}/{item_id}"

        # Make the request using the formatted URL
        update_response = await client.post(url, json=status_update_payload)

        print(update_response.json())
        assert update_response.status_code == 200
