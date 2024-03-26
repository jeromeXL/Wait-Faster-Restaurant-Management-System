from typing import List, Set, Optional
from beanie import Document
from pydantic import BaseModel

class Category(Document):
    name: str
    menu_items: List[str]
    index: int