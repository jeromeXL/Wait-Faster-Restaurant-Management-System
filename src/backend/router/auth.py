from datetime import timedelta
from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel
from models.auth import AccessToken, RefreshToken
from models.user import User
from utils.password import hash_password
from jwt import access_security, refresh_security
from fastapi_jwt import JwtAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["Auth"])
class LoginRequest(BaseModel):
    username: str
    password: str
    
@router.post("/login") # Login with correct credentials & get JWT token and refresh token
async def login(request: LoginRequest) -> RefreshToken:
    """Authenticate and returns the user's JWT."""
    user = await User.find_by_username(request.username)
    if user is None or hash_password(request.password) != user.password:
        raise HTTPException(status_code=401, detail="Bad email or password")
    access_token = access_security.create_access_token(user.jwt_subject)
    refresh_token = refresh_security.create_refresh_token(user.jwt_subject)
    return RefreshToken(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh") # pass a refresh token, and get a new JWT.
async def refresh(
    auth: JwtAuthorizationCredentials = Security(refresh_security)
) -> AccessToken:
    """Return a new access token from a refresh token."""
    access_token = access_security.create_access_token(subject=auth.subject)
    return AccessToken(access_token=access_token)