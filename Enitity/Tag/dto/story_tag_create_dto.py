from pydantic import BaseModel

class StoryTagCreateDto(BaseModel):
    tag_name: str