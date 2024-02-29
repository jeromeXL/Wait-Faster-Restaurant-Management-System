from datetime import timedelta
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    token_expiry_time: timedelta = AC
@router.post("/login")
async def login(request: LoginRequest) -> 
    # """Authenticate and returns the user's JWT."""
    # user = await User.by_email(user_auth.email)
    # if user is None or hash_password(user_auth.password) != user.password:
    #     raise HTTPException(status_code=401, detail="Bad email or password")
    # if user.email_confirmed_at is None:
    #     raise HTTPException(status_code=400, detail="Email is not yet verified")
    # access_token = access_security.create_access_token(user.jwt_subject)
    # refresh_token = refresh_security.create_refresh_token(user.jwt_subject)
    # return RefreshToken(access_token=access_token, refresh_token=refresh_token)