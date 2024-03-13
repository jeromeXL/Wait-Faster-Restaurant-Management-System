from typing import Set, Optional
from beanie import Document
from pydantic import BaseModel

class Category(Document):
    name: str
    menu_items: Set[str]
    index: int