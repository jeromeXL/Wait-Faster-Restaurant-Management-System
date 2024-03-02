import pytest
from models.auth import AccessToken, RefreshToken
from tests.integration.client import get_client
from config import CONFIG

## Intended to be tested with a fresh db.
@pytest.mark.asyncio
async def test_default_user_can_login_and_get_jwt():

	async with await get_client() as client:
		response = await client.post("/auth/login", json={
			"username" : CONFIG.default_user_username,
			"password" : CONFIG.default_user_password
		})
		assert response.status_code == 200
		token = response.json()
		try:
			RefreshToken.model_validate(token)
		except Exception as e: 
			raise ValueError(f"Returned value is not the correct format : {e}")
		
@pytest.mark.asyncio
async def test_cannot_login_with_incorrect_credentials():

	async with await get_client() as client:
		response = await client.post("/auth/login", json={
			"username" : "BAD",
			"password" : "BADUSERNAME"
		})
		assert response.status_code == 401
		assert response.json() == {'detail': "Bad email or password"}

@pytest.mark.asyncio
async def test_default_user_can_refresh_token():

	async with await get_client() as client:

		## Get the token
		response = await client.post("/auth/login", json={
			"username" : CONFIG.default_user_username,
			"password" : CONFIG.default_user_password
		})
		assert response.status_code == 200
		token = RefreshToken.model_validate(response.json())
		
		## Refresh the token
		refreshResponse = await client.post("/auth/refresh", headers={
			"authorization" : f"Bearer {token.refresh_token}"
		})
		assert refreshResponse.status_code == 200
		newRefreshToken = refreshResponse.json()
		try:
			AccessToken.model_validate(newRefreshToken)
		except Exception as e:
			raise ValueError(f"The response did not have the correct format: {e}")

@pytest.mark.asyncio
async def test_default_user_cannot_refresh_token_with_invalid_token():

	async with await get_client() as client:

		## Get the token
		response = await client.post("/auth/login", json={
			"username" : CONFIG.default_user_username,
			"password" : CONFIG.default_user_password
		})
		assert response.status_code == 200
		token = RefreshToken.model_validate(response.json())
		
		## Refresh the token
		refreshResponse = await client.post("/auth/refresh", headers={
			"authorization" : f"Bearer bad token"
		})
		assert refreshResponse.status_code == 401
		
# TEMPORARY TEST TO SHOW AUTH
@pytest.mark.asyncio
async def test_auth_demo():

	async with await get_client() as client:

		## Get the token
		response = await client.post("/auth/login", json={
			"username" : CONFIG.default_user_username,
			"password" : CONFIG.default_user_password
		})
		assert response.status_code == 200
		token = RefreshToken.model_validate(response.json())
		
		## Refresh the token
		refreshResponse = await client.get("/auth/example/AdminOnly", headers={
			"authorization" : f"Bearer {token.refresh_token}"
		})

		assert refreshResponse.status_code == 200
		
