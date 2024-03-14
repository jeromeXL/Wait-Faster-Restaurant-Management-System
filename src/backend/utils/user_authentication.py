from fastapi import HTTPException, Security
from fastapi_jwt import JwtAuthorizationCredentials

from models.user import User, UserRole
from jwt import access_security, user_from_credentials

# Checks if the user is logged in, and returns that user.


async def current_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    """Return the current authorized user."""
    if not auth:
        raise HTTPException(401, "No authorization credentials found")
    user = await user_from_credentials(auth)
    if user is None:
        raise HTTPException(404, "Authorized user could not be found")
    return user

# Checks if the user is logged in, and checks that they are a user admin.


async def admin_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    return await user_of_role(auth, UserRole.USER_ADMIN)

# Checks if the user is logged in, and checks that they are a customer tablet.


async def customer_tablet_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    return await user_of_role(auth, UserRole.CUSTOMER_TABLET)

# Checks if the user is logged in, and checks that they are a kitchen staff.


async def kitchen_staff_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    return await user_of_role(auth, UserRole.KITCHEN_STAFF)

# Checks if the user is logged in, and checks that they are a manager.


async def manager_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    return await user_of_role(auth, UserRole.MANAGER)

# Checks if the user is logged in, and checks that they are a wait staff.


async def wait_staff_user(
    auth: JwtAuthorizationCredentials = Security(access_security)
) -> User:
    return await user_of_role(auth, UserRole.WAIT_STAFF)


async def user_of_role(auth: JwtAuthorizationCredentials, userRole: UserRole):
    if not auth:
        raise HTTPException(401, "No authorization credentials found")
    user = await user_from_credentials(auth)
    if user is None:
        raise HTTPException(404, "Authorized user could not be found")

    if user.role != userRole:
        raise HTTPException(401, "Not authorized to access this resource.")

    return user
