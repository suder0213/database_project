from datetime import datetime
from typing import Optional

class Review:
    def __init__(self, review_id: Optional[int] = None, user_id: int = None, 
                 place_id: int = None, title: str = None, content: str = None, 
                 rating: float = None, created_at: Optional[datetime] = None, 
                 user_name: Optional[str] = None, place_name: Optional[str] = None):
        self.review_id = review_id
        self.user_id = user_id
        self.place_id = place_id
        self.title = title
        self.content = content
        self.rating = rating
        self.created_at = created_at
        
        # 조인 결과 담을 필드
        self.user_name = user_name
        self.place_name = place_name