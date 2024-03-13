import pytest
from tests.integration.client import get_client
# from models.menu import Menu

# Tests
#   Checks for user

#   Get menu
#       Menu returns correct form

#   Update menu
#       Menu does not update for items that do not exist in database / duplicated items
#       Menu permits legal update


# @pytest.mark.asyncio
# async def get_menu_access():
# 	async with await get_client() as client:
#      # all members should be able to fetch the menu
#      # so no login required beforehand
# 		response = await client.get("/menu")
# 		assert response.status_code == 200
# 		token = response.json()
# 		try:
# 			Menu.model_validate(token)
# 		except Exception as e:
# 			raise ValueError(f"Returned value is not the correct format : {e}")

# @pytest.mark.asyncio
# async def test_put_menu_invalid_access():
# 	async with await get_client() as client:
#      # putting a menu is invalid
#      # requires manager login

# @pytest.mark.asyncio
# async def test_put_invalid_menu():
# 	async with await get_client() as client:
#      # putting a menu is invalid
#      # requires manager login
