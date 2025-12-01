from pydantic import BaseModel

class PlaceCreateDto(BaseModel):
    name: str
    latitude: float
    longitude: float