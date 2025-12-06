from pydantic import BaseModel

class ReviewCreateDto(BaseModel):
    user_id: int
    place_id: int
    title: str
    content: str
    rating: float