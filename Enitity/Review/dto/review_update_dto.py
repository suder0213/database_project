from pydantic import BaseModel

class ReviewUpdateDto(BaseModel):
    title: str
    content: str
    rating: float