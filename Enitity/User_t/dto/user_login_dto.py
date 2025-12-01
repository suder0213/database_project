from pydantic import BaseModel

class UserLoginDto(BaseModel):
    id: str
    password: str