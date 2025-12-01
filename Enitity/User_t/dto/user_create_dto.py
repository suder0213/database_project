from pydantic import BaseModel

class UserCreateDto(BaseModel):
    id: str
    password: str
    name: str
    email: str