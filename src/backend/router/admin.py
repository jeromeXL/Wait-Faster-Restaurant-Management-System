from fastapi import APIRouter
from models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/createuser")


@router.post("/updatepassword")

@router.post("deleteuser")