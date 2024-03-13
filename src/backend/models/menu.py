from typing import Set, Optional
from beanie import Document
from pydantic import BaseModel

class Category(Document):
    name: str
    menuItem: Set[str]
    index: int

# class Menu(Document):
#     Categories: Set[str]