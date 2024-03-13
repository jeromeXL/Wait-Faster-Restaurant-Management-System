from enum import Enum
from typing import List, Optional, Set
from pydantic import BaseModel
from beanie import Document

'''class DietaryDetail(str, Enum):
    GLUTEN_FREE = "Gluten Free"
    VEGETARIAN = "Vegetarian"
    VEGAN = "Vegan"
    SPICY = "Spicy"
    CONTAINS_NUTS = "Contains Nuts"
    CONTAINS_EGGS = "Contains Eggs"
    CONTAINS_SOY = "Contains Soy"'''
    
class MenuItem(Document):
    name: str
    price: float
    # dietary_details: Optional[List[DietaryDetail]] = None
    health_requirements: Set[str]
    description: str