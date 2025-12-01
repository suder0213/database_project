from pydantic import BaseModel

class PlaceUpdateDto(BaseModel):
    name: str
    latitude: float
    longitude: float