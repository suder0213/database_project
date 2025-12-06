from datetime import datetime
from typing import Optional

class Like_t:
    def __init__(self, like_id: Optional[int] = None, user_id: int = None, 
                 story_id: int = None, created_at: Optional[datetime] = None,
                 user_name: Optional[str] = None, story_content: Optional[str] = None):
        self.like_id = like_id
        self.user_id = user_id
        self.story_id = story_id
        self.created_at = created_at
        
        # 조인 결과 필드
        self.user_name = user_name
        self.story_content = story_content