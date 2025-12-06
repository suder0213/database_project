from pydantic import BaseModel
from typing import Optional

class StoryCreateDto(BaseModel):
    user_id: int
    content: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None