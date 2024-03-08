from typing import List, Optional
from beanie import Document
from pydantic import BaseModel

class Category(Document):
    id: str
    name: str
    menuItem: List[str]

class Menu(Document):
    Categories: List[str]