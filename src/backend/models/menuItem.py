from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel, Field
from beanie import Document

class MenuItem(Document):
    name: str
    price: float
    health_requirements: List[str]
    description: str
    ingredients: List[str]
    photo_url: Optional[str] = Field(default=None)
