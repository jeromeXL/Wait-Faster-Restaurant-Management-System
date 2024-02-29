from enum import Enum
from typing import Optional
from beanie import Document
from pydantic import BaseModel

class UserRole(Enum):
	USER_ADMIN = 1
	MANAGER = 2
	WAIT_STAFF = 3
	KITCHEN_STAFF = 4
	CUSTOMER_TABLET = 5

class User(Document):
	username: str
	password: str # Hashed password
	role: UserRole

	@classmethod
	async def find_by_username(self, username: str) -> Optional["User"]:
		return await self.find_one(self.username == username)
	