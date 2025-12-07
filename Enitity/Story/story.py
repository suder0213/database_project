from datetime import datetime
from typing import Optional

class Story:
    def __init__(self, story_id: Optional[int] = None, user_id: Optional[int] = None, 
                 image_url: Optional[str] = None, content: Optional[str] = None, 
                 latitude: float = None, longitude: float = None, 
                 likes: Optional[int] = 0, created_at: Optional[datetime] = None,
                 user_name: Optional[str] = None):
        self.story_id = story_id
        self.user_id = user_id
        self.image_url = image_url
        self.content = content
        self.latitude = latitude
        self.longitude = longitude
        self.likes = likes
        self.created_at = created_at
        self.user_name = user_name


'''
    def to_dict(self):
        return {
            "story_id": self.story_id,
            "user_id": self.user_id,
            "image_url": self.image_url,
            "content": self.content,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "likes": self.likes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    '''