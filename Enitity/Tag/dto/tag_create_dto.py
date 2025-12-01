from pydantic import BaseModel

class TagCreateDto(BaseModel):
    name: str