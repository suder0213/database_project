from Enitity.Review import Review, ReviewCreateDto, ReviewUpdateDto
from datetime import datetime
import oracledb

class ReviewService:
    def __init__(self, db: oracledb.Connection):
        self.db = db
    
    # [추가] LOB 객체일 경우 문자열로 변환해주는 헬퍼 함수
    def _get_value(self, val):
        if isinstance(val, oracledb.LOB):
            return val.read()
        return val

    # 헬퍼 함수: 장소 평점 업데이트
    def _update_place_rating(self, place_id: int):
        cursor = self.db.cursor()
        try:
            sql = """UPDATE PLACE SET average_rating = (
                        SELECT NVL(AVG(rating), 0) FROM REVIEW WHERE place_id = :1
                     ) WHERE place_id = :2"""
            cursor.execute(sql, (place_id, place_id))
            self.db.commit()
            print(f"Updated average rating for place {place_id}")
        except Exception as e:
            print(f"Error updating place rating: {e}")
            import traceback
            traceback.print_exc()
        finally:
            cursor.close()

    # 1. 리뷰 작성
    def create_review(self, review_data: dict):
        cursor = self.db.cursor()
        try:
            sql = """
                INSERT INTO REVIEW (review_id, user_id, place_id, title, content, rating, created_at) 
                VALUES (REVIEW_SEQ.NEXTVAL, :1, :2, :3, :4, :5, SYSDATE)
                RETURNING review_id INTO :6
            """
            review_id_var = cursor.var(int)
            cursor.execute(sql, (
                review_data['user_id'], review_data['place_id'],
                review_data['title'], review_data['content'],
                review_data['rating'], review_id_var
            ))
            self.db.commit()
            
            created_id = review_id_var.getvalue()[0]
            self._update_place_rating(review_data['place_id'])
            
            return created_id
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error creating review: {e}")
            return None
        finally:
            cursor.close()

    # 2. 리뷰 단건 조회 (수정됨: _get_value 사용)
    def get_review_by_id(self, review_id: int):
        cursor = self.db.cursor()
        try:
            sql = """
                SELECT r.review_id, r.title, r.content, r.rating, r.created_at, u.name, p.name
                FROM REVIEW r
                JOIN USER_T u ON r.user_id = u.user_id
                JOIN PLACE p ON r.place_id = p.place_id
                WHERE r.review_id = :1
            """
            cursor.execute(sql, (review_id,))
            row = cursor.fetchone()
            
            if row:
                # row[1](title)과 row[2](content)가 LOB일 수 있으므로 변환
                return Review(
                    review_id=row[0], 
                    title=self._get_value(row[1]), 
                    content=self._get_value(row[2]), 
                    rating=row[3], created_at=row[4], 
                    user_name=row[5], place_name=row[6]
                )
            return None
        except Exception as e:
            print(f"Error getting review: {e}")
            return None
        finally:
            cursor.close()

    # 3. 장소별 리뷰 목록 (수정됨: _get_value 사용)
    def get_reviews_by_place(self, place_id: int):
        cursor = self.db.cursor()
        try:
            sql = """
                SELECT r.review_id, r.title, r.content, r.rating, r.created_at, r.user_id, u.name
                FROM REVIEW r
                JOIN USER_T u ON r.user_id = u.user_id
                WHERE r.place_id = :1
                ORDER BY r.created_at DESC
            """
            cursor.execute(sql, (place_id,))
            rows = cursor.fetchall()
            
            reviews = []
            for row in rows:
                reviews.append(Review(
                    review_id=row[0], 
                    title=self._get_value(row[1]), 
                    content=self._get_value(row[2]), 
                    rating=row[3], created_at=row[4], user_id=row[5], user_name=row[6]
                ))
            return reviews
        except Exception as e:
            print(f"Error getting place reviews: {e}")
            return []
        finally:
            cursor.close()

    # 4. 사용자별 리뷰 목록 (수정됨: _get_value 사용, 좌표 추가)
    def get_reviews_by_user(self, user_id: int):
        cursor = self.db.cursor()
        try:
            sql = """
                SELECT r.review_id, r.title, r.content, r.rating, r.created_at, r.place_id, p.name, p.latitude, p.longitude
                FROM REVIEW r
                JOIN PLACE p ON r.place_id = p.place_id
                WHERE r.user_id = :1
                ORDER BY r.created_at DESC
            """
            cursor.execute(sql, (user_id,))
            rows = cursor.fetchall()
            
            reviews = []
            for row in rows:
                reviews.append(Review(
                    review_id=row[0], 
                    title=self._get_value(row[1]), 
                    content=self._get_value(row[2]), 
                    rating=row[3], created_at=row[4], place_id=row[5], place_name=row[6],
                    latitude=row[7], longitude=row[8]
                ))
            return reviews
        except Exception as e:
            print(f"Error getting user reviews: {e}")
            return []
        finally:
            cursor.close()

    # 5. 리뷰 수정
    def update_review(self, review_id: int, update_data: dict):
        cursor = self.db.cursor()
        try:
            check_sql = "SELECT place_id FROM REVIEW WHERE review_id = :1"
            cursor.execute(check_sql, (review_id,))
            row = cursor.fetchone()
            if not row: return False
            place_id = row[0]

            sql = "UPDATE REVIEW SET title = :1, content = :2, rating = :3 WHERE review_id = :4"
            cursor.execute(sql, (
                update_data['title'], update_data['content'], 
                update_data['rating'], review_id
            ))
            self.db.commit()
            
            self._update_place_rating(place_id)
            return cursor.rowcount > 0
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error updating review: {e}")
            return False
        finally:
            cursor.close()

    # 6. 리뷰 삭제
    def delete_review(self, review_id: int):
        cursor = self.db.cursor()
        try:
            check_sql = "SELECT place_id FROM REVIEW WHERE review_id = :1"
            cursor.execute(check_sql, (review_id,))
            row = cursor.fetchone()
            if not row: return False
            place_id = row[0]

            sql = "DELETE FROM REVIEW WHERE review_id = :1"
            cursor.execute(sql, (review_id,))
            self.db.commit()
            
            self._update_place_rating(place_id)
            return cursor.rowcount > 0
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error deleting review: {e}")
            return False
        finally:
            cursor.close()