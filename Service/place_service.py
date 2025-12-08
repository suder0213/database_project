from Enitity.Place import Place
from datetime import datetime
import oracledb

class PlaceService:
    def __init__(self, db: oracledb.Connection):
        self.db = db
    
    # 새 장소 생성
    def create_place(self, place_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO PLACE (place_id, name, latitude, longitude) VALUES (PLACE_SEQ.NEXTVAL, :1, :2, :3)"
            cursor.execute(sql, (place_data['name'], place_data['latitude'], 
                               place_data['longitude']))
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error creating place: {e}")
            return False
        finally:
            cursor.close()
    
    # 새 장소 생성하고 place_id 반환
    def create_place_and_return_id(self, place_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO PLACE (place_id, name, latitude, longitude) VALUES (PLACE_SEQ.NEXTVAL, :1, :2, :3) RETURNING place_id INTO :4"
            place_id_var = cursor.var(int)
            cursor.execute(sql, (place_data['name'], place_data['latitude'], 
                               place_data['longitude'], place_id_var))
            self.db.commit()
            return place_id_var.getvalue()[0]
        except Exception as e:
            print(f"Error creating place: {e}")
            return None
        finally:
            cursor.close()
    

    # 장소 ID로 장소 조회
    def get_place_by_id(self, place_id: int):
        cursor = self.db.cursor()
        try:
            sql = "SELECT place_id, name, average_rating, latitude, longitude, created_at FROM PLACE WHERE place_id = :1"
            cursor.execute(sql, (place_id,))
            row = cursor.fetchone()
            if row:
                return Place(*row)
            return None
        except Exception as e:
            print(f"Error getting place: {e}")
            return None
        finally:
            cursor.close()
    
    # 위치 기반 장소 검색 (lat, lng 파라미터 사용)
    def search_places_by_location(self, lat: float, lng: float, radius: float = 1.0):
        cursor = self.db.cursor()
        try:
            # TODO: 실제 거리 계산 공식으로 개선 예정 (하버사인 공식 등)
            # 현재는 간단한 유클리드 거리 사용
            sql = """SELECT place_id, name, average_rating, latitude, longitude, created_at 
                     FROM PLACE 
                     WHERE SQRT(POWER(latitude - :1, 2) + POWER(longitude - :2, 2)) <= :3"""
            cursor.execute(sql, (lat, lng, radius))
            rows = cursor.fetchall()
            return [Place(*row) for row in rows]
        except Exception as e:
            print(f"Error searching places by location: {e}")
            return []
        finally:
            cursor.close()
    
    # 위치 기반 장소 검색 (프론트엔드 응답 형식)
    def search_places_for_frontend(self, lat: float, lng: float, radius: float = 1.0):
        places = self.search_places_by_location(lat, lng, radius)
        
        places_data = []
        for place in places:
            places_data.append({
                "place_id": place.place_id,
                "name": place.name,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "average_rating": place.average_rating
            })
        
        return {"places": places_data}
    
    # 영역 기반 장소 검색 (bounds) - 최적화
    def search_places_by_bounds(self, sw_lat: float, sw_lng: float, ne_lat: float, ne_lng: float):
        cursor = self.db.cursor()
        try:
            sql = """
                SELECT place_id, name, average_rating, latitude, longitude
                FROM PLACE
                WHERE latitude BETWEEN :1 AND :2
                  AND longitude BETWEEN :3 AND :4
            """
            cursor.execute(sql, (sw_lat, ne_lat, sw_lng, ne_lng))
            rows = cursor.fetchall()
            
            places_data = []
            for row in rows:
                places_data.append({
                    "place_id": row[0],
                    "name": row[1],
                    "average_rating": row[2],
                    "latitude": row[3],
                    "longitude": row[4]
                })
            return {"places": places_data}
        except Exception as e:
            return {"places": []}
        finally:
            cursor.close()
    
    # 장소 정보 수정
    def update_place(self, place_id: int, place_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "UPDATE PLACE SET name = :1, latitude = :2, longitude = :3 WHERE place_id = :4"
            cursor.execute(sql, (place_data['name'], place_data['latitude'], 
                               place_data['longitude'], place_id))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating place: {e}")
            return False
        finally:
            cursor.close()
    
    # 장소 삭제
    def delete_place(self, place_id: int):
        cursor = self.db.cursor()
        try:
            sql = "DELETE FROM PLACE WHERE place_id = :1"
            cursor.execute(sql, (place_id,))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting place: {e}")
            return False
        finally:
            cursor.close()
    
    # 장소 평균 평점 업데이트
    def update_average_rating(self, place_id: int):
        cursor = self.db.cursor()
        try:
            sql = """UPDATE PLACE SET average_rating = (
                        SELECT AVG(rating) FROM REVIEW WHERE place_id = :1
                     ) WHERE place_id = :1"""
            cursor.execute(sql, (place_id,))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating average rating: {e}")
            return False
        finally:
            cursor.close()