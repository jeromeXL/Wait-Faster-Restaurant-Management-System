from fastapi import APIRouter, HTTPException, Depends, Response
from models.user import User, UserRole
from utils.user_authentication import admin_user
from utils.password import hash_password
from utils.regex import matchesTablePattern

router = APIRouter()

# Get all users
@router.get("/users")
async def getUsers(adminUser = Depends(admin_user)) -> list:
    if not adminUser:
        raise HTTPException(status_code=403, detail="403 Forbidden: Only admins can get users info")
    users = await User.find_all().to_list() # Users.find_all() returns a queryable. Then calling .to_list() will transform that into a list. 
    return users

# Get user by username
@router.get("/user/{username}")
async def getUser(username: str, adminUser = Depends(admin_user)) -> User:
    if not adminUser:
        raise HTTPException(status_code=403, detail="403 Forbidden: Only admins can get user info")
    user = await User.find_one(User.username == username)
    return user

# Create User -> Returns user object
@router.post("/user/create")
async def createUser(newUser: User, adminUser = Depends(admin_user)) -> User:
    if not adminUser:
        raise HTTPException(status_code=403, detail="403 Forbidden: Only admins can create users")
    if not matchesTablePattern(newUser.username) and newUser.role == UserRole.CUSTOMER_TABLET:
        raise HTTPException(status_code=405, detail="422 Unprocessable Entity: Table names must be in format 'Table<Number>'")
    newUsernameTaken = await User.find_by_username(newUser.username)
    if newUsernameTaken:
        raise HTTPException(status_code=409, detail="409 Conflict: New username already exists. Duplicate usernames not allowed")
    user = User(username=newUser.username, password=hash_password(newUser.password), role=newUser.role)
    await user.create() # On an instance, call create.
    return user

# Update User (Previously Update Password)
@router.put("/user/update/{username}")
async def updateUser(username: str, newUserInfo: User, adminUser = Depends(admin_user)) -> User:
    if not adminUser:
        raise HTTPException(status_code=401, detail="403 Forbidden: Only admins can update users")
    if not matchesTablePattern(newUserInfo.username) and newUserInfo.role == UserRole.CUSTOMER_TABLET:
        raise HTTPException(status_code=405, detail="422 Unprocessable Entity: Table names must be in format 'Table<Number>'")
    #user = await User.find_one(User.id == user_id) # cant find by id for some reason
    user = await User.find_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="404 Not Found: User does not exist")
    newUsernameTaken = await User.find_by_username(newUserInfo.username)
    if newUsernameTaken:
        raise HTTPException(status_code=409, detail="409 Conflict: New username already exists. Duplicate usernames not allowed")
    user.username = newUserInfo.username
    user.password = hash_password(newUserInfo.password)
    user.role = newUserInfo.role
    
    await user.save()
    return user

# Delete User   
@router.delete("/user/delete/{username}")
async def delete_user(username: str, adminUser = Depends(admin_user)) -> Response:
    if not adminUser:
        raise HTTPException(status_code=401, detail="403 Forbidden: Only admins can delete users")
    #user = await User.find_one(User.id == user_id) cant find by id for some reason
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="404 Not Found: User does not exist")
    await user.delete()
    return Response(status_code=200)
