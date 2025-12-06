from pydantic import BaseModel

class LikeToggleDto(BaseModel):
    user_id: int
    story_id: int