from database import db_connection
from Enitity.Story import Story
from datetime import datetime
import oracledb

class StoryService:
    def __init__(self):
        self.db = db_connection
    
    def _get_value(self, val):
        if isinstance(val, oracledb.LOB):
            return val.read()
        return val
    
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
                    story_id=row[0], user_id=row[1], content=self._get_value(row[2]), image_url=row[3],
                    latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                    user_name=row[8]
                ))
            return stories
        except Exception as e:
            print(f"Error getting user stories: {e}")
            return []
        finally:
            cursor.close()

    # 3. 지도 영역으로 스토리 검색 (bounds)
    def search_stories_by_bounds(self, sw_lat: float, sw_lng: float, ne_lat: float, ne_lng: float):
        cursor = self.db.get_cursor()
        try:
            print(f"Searching stories in bounds: SW({sw_lat}, {sw_lng}) ~ NE({ne_lat}, {ne_lng})")
            
            sql = """
                SELECT s.story_id, s.user_id, s.content, s.image_url, s.latitude, s.longitude, s.likes, s.created_at, u.name
                FROM STORY s
                JOIN USER_T u ON s.user_id = u.user_id
                WHERE s.latitude BETWEEN :1 AND :2
                  AND s.longitude BETWEEN :3 AND :4
                ORDER BY s.created_at DESC
            """
            cursor.execute(sql, (sw_lat, ne_lat, sw_lng, ne_lng))
            rows = cursor.fetchall()
            
            print(f"Found {len(rows)} stories in bounds")
            
            stories = []
            for row in rows:
                stories.append(Story(
                    story_id=row[0], user_id=row[1], content=self._get_value(row[2]), image_url=row[3],
                    latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                    user_name=row[8]
                ))
            return stories
        except Exception as e:
            print(f"Error searching stories by bounds: {e}")
            import traceback
            traceback.print_exc()
            return []
        finally:
            cursor.close()
    
    # 3-1. 위치 기반 스토리 검색 (간단한 방식)
    def search_stories_by_location(self, lat: float, lng: float, radius: float = 1.0):
        cursor = self.db.get_cursor()
        try:
            print(f"Searching stories at lat={lat}, lng={lng}, radius={radius}km")
            
            # 위도/경도 범위로 간단하게 검색 (1도 ≈ 111km)
            lat_range = radius / 111.0
            lng_range = radius / (111.0 * abs(lat / 90.0)) if lat != 0 else radius / 111.0
            
            sql = """
                SELECT s.story_id, s.user_id, s.content, s.image_url, s.latitude, s.longitude, s.likes, s.created_at, u.name
                FROM STORY s
                JOIN USER_T u ON s.user_id = u.user_id
                WHERE s.latitude BETWEEN :1 AND :2
                  AND s.longitude BETWEEN :3 AND :4
                ORDER BY s.created_at DESC
            """
            cursor.execute(sql, (
                lat - lat_range, lat + lat_range,
                lng - lng_range, lng + lng_range
            ))
            rows = cursor.fetchall()
            
            print(f"Found {len(rows)} stories within {radius}km (approx)")
            
            stories = []
            for row in rows:
                stories.append(Story(
                    story_id=row[0], user_id=row[1], content=self._get_value(row[2]), image_url=row[3],
                    latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                    user_name=row[8]
                ))
            return stories
        except Exception as e:
            print(f"Error searching stories: {e}")
            import traceback
            traceback.print_exc()
            # 에러 발생 시 전체 스토리 반환
            try:
                sql = "SELECT s.story_id, s.user_id, s.content, s.image_url, s.latitude, s.longitude, s.likes, s.created_at, u.name FROM STORY s JOIN USER_T u ON s.user_id = u.user_id ORDER BY s.created_at DESC"
                cursor.execute(sql)
                rows = cursor.fetchall()
                stories = []
                for row in rows:
                    stories.append(Story(
                        story_id=row[0], user_id=row[1], content=self._get_value(row[2]), image_url=row[3],
                        latitude=row[4], longitude=row[5], likes=row[6], created_at=row[7],
                        user_name=row[8]
                    ))
                return stories
            except:
                return []
        finally:
            cursor.close()

    # 프론트엔드용 포맷팅 (PlaceService 스타일 참고)
    def format_stories_response(self, stories):
        stories_data = []
        for s in stories:
            # 이미지 URL 처리: 상대 경로면 절대 경로로 변환
            image_url = s.image_url
            if image_url and not image_url.startswith('http'):
                image_url = f"http://localhost:8000{image_url if image_url.startswith('/') else '/' + image_url}"
            
            stories_data.append({
                "story_id": s.story_id,
                "content": s.content,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "image_url": image_url,
                "likes": s.likes,
                "user_name": s.user_name,
                "created_at": s.created_at.isoformat() if s.created_at else None
            })
        return {"stories": stories_data}
    
    # 4. 스토리 수정
    def update_story(self, story_id: int, story_data: dict):
        cursor = self.db.get_cursor()
        try:
            updates = []
            params = []
            
            if 'content' in story_data and story_data['content'] is not None:
                updates.append("content = :1")
                params.append(story_data['content'])
            
            if 'image_url' in story_data and story_data['image_url'] is not None:
                updates.append(f"image_url = :{len(params) + 1}")
                params.append(story_data['image_url'])
            
            if not updates:
                return False
            
            params.append(story_id)
            sql = f"UPDATE STORY SET {', '.join(updates)} WHERE story_id = :{len(params)}"
            
            cursor.execute(sql, params)
            self.db.connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating story: {e}")
            return False
        finally:
            cursor.close()
    
    # 5. 스토리 삭제
    def delete_story(self, story_id: int):
        cursor = self.db.get_cursor()
        try:
            sql = "DELETE FROM STORY WHERE story_id = :1"
            cursor.execute(sql, (story_id,))
            self.db.connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting story: {e}")
            return False
        finally:
            cursor.close()