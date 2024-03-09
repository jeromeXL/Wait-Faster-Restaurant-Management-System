from fastapi import APIRouter, HTTPException, Depends, Response
from models.user import User
from utils.user_authentication import admin_user
from utils.password import hash_password

router = APIRouter()

# Get all users
@router.get("/users")
async def getUsers():
    users = await User.find_all()
    print("route worked")
    return("route worked")
    return users

# Create User -> Returns user object
@router.post("/user/create")
async def createUser(newUser: User, adminUser = Depends(admin_user)) -> User:
    if not adminUser:
        raise HTTPException(status_code=401, detail="Only admins can create users")
    user = User(username=newUser.username, password=hash_password(newUser.password), role=newUser.role)
    await user.insert()
    return user

# Update User (Previously Update Password)
@router.put("/user/update/{user_id}")
async def updateUser(user_id: str, newUserInfo: User, adminUser = Depends(admin_user())) -> Response:
    if not adminUser:
        raise HTTPException(status_code=401, detail="Only admins can update users")
    user = await User.find_one(User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    hashedUserInfo = User(username=newUserInfo.username, password=hash_password(newUserInfo.password), role=newUserInfo.role)
    await user.set(hashedUserInfo)
    return Response(status_code=200)

# Delete User   
@router.delete("/user/delete/{user_id}")
async def delete_user(user_id: str, adminUser = Depends(admin_user())) -> Response:
    if not adminUser:
        raise HTTPException(status_code=401, detail="Only admins can delete users")
    user = await User.find_one(User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    await user.delete()
    return Response(status_code=200)
