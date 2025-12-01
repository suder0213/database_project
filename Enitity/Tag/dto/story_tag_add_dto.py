from pydantic import BaseModel

class StoryTagAddDto(BaseModel):
    tag_id: int