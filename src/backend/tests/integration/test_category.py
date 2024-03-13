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

        yield client
        # Dispose of client

# Add category
#   Catch invalid category with empty name
#   Catch doubled category
#   Permits legal category


@pytest.mark.asyncio
async def test_create_category_invalid_no_name(manager_client):

    # Create a new menu item
    response = await manager_client.post("/category/new", json={
        "name": "",
        "menuItem": [],
        "index": -1
    })
    assert response.status_code == 400
    assert response.json() == {'detail': "Category name cannot be empty"}

@pytest.mark.asyncio
async def test_create_category_invalid_duplicate(manager_client):
    print(await manager_client.post("/category/count"))


    # Create a new menu item
    response = await manager_client.post("/category/new", json={
        "name": "ex2",
        "menuItem": [],
        "index": -1
    })
    assert response.status_code == 200
    assert response.json() == {'detail': "Category name cannot be empty"}

    response2 = await manager_client.post("/category/new", json={
        "name": "ex3",
        "menuItem": [],
        "index": -1
    })
    assert response.status_code == 400
    assert response.json() == {'detail': "Category name cannot be duplicated"}

@pytest.mark.asyncio
async def test_create_category_valid(manager_client):

	# Create a new menu item
	response = await manager_client.post("/category/new", json={
		"name": "Test Item",
		"menuItem": []
	})
	assert response.status_code == 200
	category = response.json()
	assert "id" in category
	assert category["name"] == "Test Item"
	assert category["menuItem"] == []
	assert category["index"] == -1

# Update category
#   Catch updating nonexistent category
#   Catch updating existing category but with invalid data
#   Permits legal update

@pytest.mark.asyncio
async def test_update_category_invalid_does_not_exist(manager_client):

    # from an empty collection of categories

	# Create a new menu item
	response = await manager_client.put("/category/notreal", json={
		"name": "not exist",
		"menuItem": []
	})
	assert response.status_code == 404
	category = response.json()
	assert "id" in category
	assert category["name"] == "Test Item"
	assert category["menuItem"] == []
	assert category["index"] == -1

@pytest.mark.asyncio
async def test_update_category_invalid_bad_name(manager_client):

    # from an empty collection of categories

	# Create a new valid category
    # get id

    # update category with new category with no name
	# assert response.status_code == 400
    assert False

@pytest.mark.asyncio
async def test_update_category_valid(manager_client):

    # from an empty collection of categories

	# Create a new category item
	response = await manager_client.put("/category/notreal", json={
		"name": "not exist",
		"menuItem": []
	})
    # get id
 	# Update category item
	response = await manager_client.put("/category/notreal", json={
		"name": "not exist",
		"menuItem": []
	})
	assert response.status_code == 404
	category = response.json()
	assert "id" in category
	assert category["name"] == "Test Item"
	assert category["menuItem"] == []
	assert category["index"] == -1

# Remove category
#   Catch removing nonexistent category
#   Permits legal removal

@pytest.mark.asyncio
async def test_delete_category_valid(manager_client):

    # from an empty collection of categories

	# Create 3 new category items
	response = await manager_client.post("/category/new", json={
		"name": "del1",
		"menuItem": []
	})
	category1 = response.json()

	response = await manager_client.post("/category/new", json={
		"name": "del2",
		"menuItem": []
	})
	category2 = response.json()

	response = await manager_client.post("/category/new", json={
		"name": "del3",
		"menuItem": []
	})
	category3 = response.json()

    # delete 2nd one by id
	manager_client.delete(f"/category/{category2.id}")

	# get all categories
	response = await manager_client.get(f"/category/all")
	    # check that there isn't a category with the same name as del2
    	# assert False
