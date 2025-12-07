from pydantic import BaseModel
from typing import Optional

class StoryUpdateDto(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
