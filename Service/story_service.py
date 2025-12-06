from database import db_connection
from Enitity.Story import Story
from datetime import datetime

class StoryService:
    def __init__(self):
        self.db = db_connection
    
    # 1. 스토리 생성 (명세서: story_id 반환 필요)
    def create_story(self, story_data: dict):
        cursor = self.db.get_cursor()
        try:
            # Oracle RETURNING 절을 사용하여 생성된 ID를 바로 받아옵니다.
            sql = """
                INSERT INTO STORY (story_id, user_id, content, image_url, latitude, longitude, created_at, likes) 
                VALUES (STORY_SEQ.NEXTVAL, :1, :2, :3, :4, :5, SYSDATE, 0) 
                RETURNING story_id INTO :6
            """
            story_id_var = cursor.var(int)
            
            cursor.execute(sql, (
                story_data['user_id'],
                story_data['content'],
                story_data['image_url'],
                story_data['latitude'],
                story_data['longitude'],
                story_id_var
            ))
            
            self.db.connection.commit()
            return story_id_var.getvalue()[0] # 생성된 story_id 반환
            
        except Exception as e:
            print(f"Error creating story: {e}")
            return None
        finally:
            cursor.close()

    # 2. 내 스토리 조회
    def get_stories_by_user(self, user_id: int):
        cursor = self.db.get_cursor()
        try:
            # USER_T와 조인하여 user_name까지 가져옴 (명세서 형식 통일성을 위해)
            sql = """
                SELECT s.story_id, s.user_id, s.content, s.image_url, s.latitude, s.longitude, s.likes, s.created_at, u.name
                FROM STORY s
                JOIN USER_T u ON s.user_id = u.user_id
                WHERE s.user_id = :1
                ORDER BY s.created_at DESC
            """
            cursor.execute(sql, (user_id,))
            rows = cursor.fetchall()
            
            stories = []
            for row in rows:
                # row 순서: 0:id, 1:user_id, 2:content, 3:img, 4:lat, 5:lon, 6:likes, 7:date, 8:name
                stories.append(Story(
                    story_id=row[0], user_id=row[1], content=row[2], image_url=row[3],
                    latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                    user_name=row[8]
                ))
            return stories
        except Exception as e:
            print(f"Error getting user stories: {e}")
            return []
        finally:
            cursor.close()

    # 3. 위치 기반 스토리 검색 (반경 검색 + 유저 이름 포함)  보류사항
    def search_stories_by_location(self, lat: float, lng: float, radius: float = 1.0):
        cursor = self.db.get_cursor()
        try:
            # 거리 계산 + USER_T 조인
            sql = """
                SELECT s.story_id, s.user_id, s.content, s.image_url, s.latitude, s.longitude, s.likes, s.created_at, u.name
                FROM STORY s
                JOIN USER_T u ON s.user_id = u.user_id
                WHERE SQRT(POWER(s.latitude - :1, 2) + POWER(s.longitude - :2, 2)) <= :3
            """
            cursor.execute(sql, (lat, lng, radius))
            rows = cursor.fetchall()
            
            stories = []
            for row in rows:
                stories.append(Story(
                    story_id=row[0], user_id=row[1], content=row[2], image_url=row[3],
                    latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                    user_name=row[8]
                ))
            return stories
        except Exception as e:
            print(f"Error searching stories: {e}")
            return []
        finally:
            cursor.close()

    # 프론트엔드용 포맷팅 (PlaceService 스타일 참고)
    def format_stories_response(self, stories):
        stories_data = []
        for s in stories:
            stories_data.append({
                "story_id": s.story_id,
                "content": s.content,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "image_url": s.image_url,
                "likes": s.likes,
                "user_name": s.user_name,
                "created_at": s.created_at
            })
        return {"stories": stories_data}