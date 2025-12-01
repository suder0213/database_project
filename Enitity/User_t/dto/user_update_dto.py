from pydantic import BaseModel

class UserUpdateDto(BaseModel):
    name: str
    email: str