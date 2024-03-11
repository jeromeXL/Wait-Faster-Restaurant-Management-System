import pytest
from tests.integration.client import get_client

@pytest.mark.asyncio
async def test_menu_valid():
	async with await get_client() as client:


# TODO
# - valid objects
# - invalid object