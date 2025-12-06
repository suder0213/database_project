from pydantic import BaseModel

class CommentUpdateDto(BaseModel):
    content: str