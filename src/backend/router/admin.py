from fastapi import APIRouter, HTTPException, Depends, Response
from models.user import User, UserRole
from utils.user_authentication import admin_user
from utils.password import hash_password
from utils.regex import matchesTablePattern
from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from models.session import Session, SessionStatus
from datetime import datetime

router = APIRouter()


class UserInfo(BaseModel):
    userId: str
    username: str
    role: int
    active_session: Optional[str] = Field(default=None)


# Get all users
@router.get("/users")
async def getUsers(adminUser=Depends(admin_user)) -> List[UserInfo]:
    users = await User.find_all().to_list()
    users_info_list = [
        UserInfo(
            userId=str(user.id),
            username=user.username,
            role=user.role.value,
            active_session=user.active_session,
        )
        for user in users
    ]

    return users_info_list


"""
# Get user by username
@router.get("/user/{user}")
async def getUser(userId: str, adminUser = Depends(admin_user)) -> User:
    if not adminUser:
        raise HTTPException(status_code=403, detail="403 Forbidden: Only admins can get user info")
    user = await User.find_one(User.username == username)
    user_info = UserInfo(username=user.username, role=user.role)
    return user_info
"""


# Get user by ID
@router.get("/user/{userId}")
async def getUser(userId: str, adminUser=Depends(admin_user)) -> UserInfo:

    user = await User.get(PydanticObjectId(userId))
    if user is None:
        raise HTTPException(
            status_code=404, detail="404 Not Found: Cannot find user with the given id."
        )

    user_info = UserInfo(
        userId=str(user.id),
        username=user.username,
        role=user.role,
        active_session=user.active_session,
    )
    return user_info  # 404 Not found


# Create User -> Returns user object
# When Customer Table is created, create Session
class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: UserRole


@router.post("/user/create")
async def createUser(
    newUser: CreateUserRequest, adminUser=Depends(admin_user)
) -> UserInfo:
    if not adminUser:
        raise HTTPException(
            status_code=403, detail="403 Forbidden: Only admins can create users"
        )
    if (
        not matchesTablePattern(newUser.username)
        and newUser.role == UserRole.CUSTOMER_TABLET
    ):
        raise HTTPException(
            status_code=422,
            detail="422 Unprocessable Entity: Table names must be in format 'Table<Number>'",
        )
    newUsernameTaken = await User.find_by_username(newUser.username)
    if newUsernameTaken:
        raise HTTPException(
            status_code=409,
            detail="409 Conflict: New username already exists. Duplicate usernames not allowed",
        )

    user = User(
        username=newUser.username,
        password=hash_password(newUser.password),
        role=newUser.role,
    )
    await user.create()  # On an instance, call create.
    user_info = UserInfo(
        userId=str(user.id), username=user.username, role=user.role.value
    )
    return user_info


# Update User (Previously Update Password)
class UpdatedUserInfo(BaseModel):
    username: Optional[str]
    password: Optional[str]
    role: Optional[int]


@router.put("/user/update/{userId}")
async def updateUser(
    userId: str, newUserInfo: UpdatedUserInfo, adminUser=Depends(admin_user)
) -> UserInfo:

    if not adminUser:
        raise HTTPException(
            status_code=403, detail="403 Forbidden: Only admins can get users info"
        )

    # parse the given user role and ensure it is a valid role
    validRoleValues = [role.value for role in UserRole]
    if newUserInfo.role not in validRoleValues:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Valid options are {', '.join(map(str, validRoleValues))}",
        )

    user = await User.get(userId)

    if not user:
        raise HTTPException(
            status_code=404, detail="404 Not Found: User does not exist"
        )
    newUsernameTaken = await User.find_by_username(newUserInfo.username)
    if newUsernameTaken and newUserInfo.username != user.username:
        raise HTTPException(
            status_code=409,
            detail="409 Conflict: New username already exists. Duplicate usernames not allowed",
        )

    user.username = (
        newUserInfo.username if newUserInfo.username is not None else user.username
    )
    user.password = (
        hash_password(newUserInfo.password)
        if newUserInfo.password is not None
        else user.password
    )
    user.role = (
        UserRole(newUserInfo.role) if newUserInfo.role is not None else user.role
    )

    await user.save()
    user_info = UserInfo(
        userId=str(user.id),
        username=user.username,
        role=user.role.value,
        active_session=user.active_session,
    )
    return user_info


# Delete User
@router.delete("/user/delete/{userId}")
async def delete_user(userId: str, adminUser=Depends(admin_user)) -> Response:
    if not adminUser:
        raise HTTPException(
            status_code=401, detail="403 Forbidden: Only admins can delete users"
        )

    user = await User.get(userId)
    if not user:
        raise HTTPException(
            status_code=404, detail="404 Not Found: User does not exist"
        )
    await user.delete()
    return Response(status_code=200)
