from typing import List, Optional
from pydantic import BaseModel
from beanie import Document

class MenuItem(Document):
    name: str
    price: float
    health_requirements: Optional[str] = None
    description: str
