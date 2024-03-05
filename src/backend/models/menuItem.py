from typing import List
from pydantic import BaseModel

class MenuItem(BaseModel):
    name: str
    price: float
    health_requirements: List[str]
    description: str
