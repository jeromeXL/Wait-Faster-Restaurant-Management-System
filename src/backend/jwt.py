"""FastAPI JWT configuration."""
from datetime import timedelta

from beanie import PydanticObjectId
from models.user import User
from config import CONFIG
from fastapi_jwt import JwtAccessBearer, JwtRefreshBearer, JwtAuthorizationCredentials

ACCESS_EXPIRES = timedelta(minutes=1440)
REFRESH_EXPIRES = timedelta(days=30)

access_security = JwtAccessBearer(
    CONFIG.jwt_secret,
    access_expires_delta=ACCESS_EXPIRES,
    refresh_expires_delta=REFRESH_EXPIRES,
)

refresh_security = JwtRefreshBearer(
    CONFIG.jwt_secret,
    access_expires_delta=ACCESS_EXPIRES,
    refresh_expires_delta=REFRESH_EXPIRES,
)


async def user_from_credentials(auth: JwtAuthorizationCredentials) -> User | None:
    """Return the user associated with auth credentials."""

    return await User.get(PydanticObjectId(auth.subject["userId"]))


async def user_from_token(token: str) -> User | None:
    """Return the user associated with a token value."""
    payload = access_security._decode(token)

    if payload is None:
        raise ValueError("Payload is empty!")

    return await User.get(payload['userId'])
