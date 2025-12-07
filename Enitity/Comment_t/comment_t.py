from datetime import datetime
from typing import Optional

class Comment_t:
    def __init__(self, comment_id: Optional[int] = None, review_id: int = None, 
                 user_id: int = None, content: str = None, 
                 created_at: Optional[datetime] = None, 
                 user_name: Optional[str] = None, review_title: Optional[str] = None,
                 place_id: Optional[int] = None, place_name: Optional[str] = None,
                 latitude: Optional[float] = None, longitude: Optional[float] = None):
        self.comment_id = comment_id
        self.review_id = review_id
        self.user_id = user_id
        self.content = content
        self.created_at = created_at
        
        # 조인 결과 필드
        self.user_name = user_name       # 작성자 이름
        self.review_title = review_title # 댓글이 달린 리뷰 제목
        self.place_id = place_id         # 장소 ID
        self.place_name = place_name     # 장소 이름
        self.latitude = latitude         # 위도
        self.longitude = longitude       # 경도