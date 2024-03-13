from typing import List, Optional
from beanie import Document
from pydantic import BaseModel

class Category(Document):
    name: str
    menuItem: List[str]
    index: int

# class Menu(Document):
#     Categories: List[str]