import pytest
from tests.integration.client import get_client


@pytest.mark.asyncio
async def test_health_check():
    async with await get_client() as client:
        response = await client.get("/healthz")
        assert response.status_code == 200
        assert response.json() == "HEALTHY"
