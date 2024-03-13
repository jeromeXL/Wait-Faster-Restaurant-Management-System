from beanie import PydanticObjectId
import pytest
from tests.integration.client import get_client
from models.menu import Category

# Tests
# Checks for manager role

import pytest_asyncio
from config import CONFIG
from models.user import User, UserRole

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

        CategoryList = await Category.find_all().to_list()
        for category in CategoryList:
            await category.delete()
        yield client
        # Dispose of client

# Add category
#   Catch invalid category with empty name
#   Catch doubled category
#   Permits legal category
@pytest.mark.asyncio
async def test_create_category_invalid_no_name(manager_client):

    # Create a new menu item
    response = await manager_client.post("/category/", json={
        "name": "",
        "menu_items": []
    })
    assert response.status_code == 400
    assert response.json() == {'detail': "Category name cannot be empty"}

@pytest.mark.asyncio
async def test_create_category_invalid_duplicate(manager_client):

    # Create a new menu item
    response = await manager_client.post("/category/", json={
        "name": "ex2",
        "menu_items": [],
    })
    assert response.status_code == 200

    response2 = await manager_client.post("/category/", json={
        "name": "ex2",
        "menu_items": [],
    })
    assert response2.status_code == 400
    assert response2.json() == {'detail': "Category name cannot be duplicated"}

@pytest.mark.asyncio
async def test_create_category_valid(manager_client):

	# Create a new menu item
	response = await manager_client.post("/category/", json={
		"name": "Test Item",
		"menu_items": []
	})
	assert response.status_code == 200
	category = response.json()
	assert "id" in category
	assert category["name"] == "Test Item"
	assert category["menu_items"] == []
	assert category["index"] == 0

# Update category
#   Catch updating nonexistent category
#   Catch updating existing category but with invalid data
#   Permits legal update
@pytest.mark.asyncio
async def test_update_category_invalid_does_not_exist(manager_client):

	# attempt to update any category
    response = await manager_client.put("/category/65f22e2c47277444c60898a6", json={
		"name": "notexist",
		"menu_items": []
	})
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_update_category_category_id_invalid_format(manager_client):

	# attempt to update any category
    response = await manager_client.put("/category/notreal", json={
		"name": "notexist",
		"menu_items": []
	})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_update_category_invalid_bad_name(manager_client):

    # from an empty collection of categories

	# Create a new valid category
    response = await manager_client.post("/category/", json={
        "name": "Test Item",
        "menu_items": [],
	})
    assert response.status_code == 200
    
    # get id
    category = response.json()

    # update category with new category with no name
    response = await manager_client.put(f"/category/{category['id']}", json={
		"name": "",
		"menu_items": [],
	})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_update_category_valid(manager_client):

	# Create a new category item
    response = await manager_client.post("/category/", json={
        "name": "Test Item",
        "menu_items": [],
	})
    assert response.status_code == 200
    # get id
    category = response.json()

 	# Update category item
    response = await manager_client.put(f"/category/{category['id']}", json={
		"name": "Change",
		"menu_items": []
	})
    
    assert response.status_code == 200
    category = response.json()
    assert "id" in category
    assert category["name"] == "Change"
    assert category["menu_items"] == []

# Remove category
#   Catch removing nonexistent category
#   Permits legal removal

@pytest.mark.asyncio
async def test_delete_category_valid(manager_client):

    # from an empty collection of categories

	# Create 3 new category items
    response = await manager_client.post("/category/", json={
		"name": "del1",
		"menu_items": []
	})
    category1 = response.json()

    response = await manager_client.post("/category/", json={
		"name": "del2",
		"menu_items": []
	})
    category2 = response.json()

    response = await manager_client.post("/category/", json={
		"name": "del3",
		"menu_items": []
	})
    category3 = response.json()

    # delete 2nd one by id
    await manager_client.delete(f"/category/{category2['id']}")

	# Ensure the category doesn't exist in the db
    categoryWithId = await Category.find_one(Category.id == PydanticObjectId(category2['id']))
    assert categoryWithId is None
        
    # check that there isn't a category with the same name as del2
    response = await manager_client.post("/category/", json={
		"name": "del2",
		"menu_items": []
	})
    # no del2 means we should be able to make it again
    assert response.status_code == 200