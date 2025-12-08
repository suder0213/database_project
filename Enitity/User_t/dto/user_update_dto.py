from pydantic import BaseModel
from typing import Optional

class UserUpdateDto(BaseModel):
    name: str
    email: str
    password: Optional[str] = None