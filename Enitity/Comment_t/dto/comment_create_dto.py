from pydantic import BaseModel

class CommentCreateDto(BaseModel):
    user_id: int
    review_id: int
    content: str