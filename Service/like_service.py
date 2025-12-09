from Enitity.Like_t import Like_t
import oracledb

class LikeService:
    def __init__(self, db: oracledb.Connection):
        self.db = db

    def _get_value(self, val):
        if isinstance(val, oracledb.LOB):
            return val.read()
        return val

    # 1. 좋아요 토글 (수정됨: like_id 제거)
    def toggle_like(self, user_id: int, story_id: int):
        cursor = self.db.cursor()
        try:
            # 1) 이미 좋아요가 있는지 확인 (user_id와 story_id로 식별)
            check_sql = "SELECT 1 FROM LIKE_T WHERE user_id = :1 AND story_id = :2"
            cursor.execute(check_sql, (user_id, story_id))
            row = cursor.fetchone()

            if row:
                # 이미 있음 -> 삭제 (좋아요 취소)
                del_sql = "DELETE FROM LIKE_T WHERE user_id = :1 AND story_id = :2"
                cursor.execute(del_sql, (user_id, story_id))
                liked = False
            else:
                # 없음 -> 추가 (좋아요)
                # like_id 컬럼과 LIKE_SEQ 시퀀스를 제거하고 insert
                ins_sql = "INSERT INTO LIKE_T (user_id, story_id, created_at) VALUES (:1, :2, SYSDATE)"
                cursor.execute(ins_sql, (user_id, story_id))
                liked = True
            
            # 2) STORY 테이블의 likes 카운트 업데이트
            update_sql = """
                UPDATE STORY SET likes = (
                    SELECT COUNT(*) FROM LIKE_T WHERE story_id = :1
                ) WHERE story_id = :2
            """
            cursor.execute(update_sql, (story_id, story_id))
            
            # 3) 업데이트된 총 좋아요 수 가져오기
            count_sql = "SELECT likes FROM STORY WHERE story_id = :1"
            cursor.execute(count_sql, (story_id,))
            total_likes = cursor.fetchone()[0]

            self.db.commit()
            
            return {
                "liked": liked, 
                "total_likes": total_likes
            }

        except Exception as e:
            print(f"Error toggling like: {e}")
            self.db.rollback()
            return None
        finally:
            cursor.close()

    # 2. 좋아요 상태 확인
    def check_like_status(self, user_id: int, story_id: int):
        cursor = self.db.cursor()
        try:
            sql = "SELECT 1 FROM LIKE_T WHERE user_id = :1 AND story_id = :2"
            cursor.execute(sql, (user_id, story_id))
            return cursor.fetchone() is not None
        except Exception as e:
            print(f"Error checking like status: {e}")
            return False
        finally:
            cursor.close()

    # 3. 스토리별 좋아요 목록 (수정됨: like_id 조회 제거)
    def get_likes_by_story(self, story_id: int):
        cursor = self.db.cursor()
        try:
            # like_id 컬럼이 없으므로 조회에서 제외
            sql = """
                SELECT l.user_id, l.created_at, u.name
                FROM LIKE_T l
                JOIN USER_T u ON l.user_id = u.user_id
                WHERE l.story_id = :1
                ORDER BY l.created_at DESC
            """
            cursor.execute(sql, (story_id,))
            rows = cursor.fetchall()
            
            likes = []
            for row in rows:
                likes.append(Like_t(
                    like_id=None, # ID 없음
                    user_id=row[0], 
                    created_at=row[1], 
                    user_name=row[2]
                ))
            return likes
        except Exception as e:
            print(f"Error getting story likes: {e}")
            return []
        finally:
            cursor.close()

    # 4. 사용자별 좋아요 목록 (수정됨: like_id 조회 제거)
    def get_likes_by_user(self, user_id: int):
        cursor = self.db.cursor()
        try:
            # like_id 컬럼 제외
            sql = """
                SELECT l.story_id, l.created_at, s.content
                FROM LIKE_T l
                JOIN STORY s ON l.story_id = s.story_id
                WHERE l.user_id = :1
                ORDER BY l.created_at DESC
            """
            cursor.execute(sql, (user_id,))
            rows = cursor.fetchall()
            
            likes = []
            for row in rows:
                likes.append(Like_t(
                    like_id=None, # ID 없음
                    story_id=row[0], 
                    created_at=row[1], 
                    story_content=self._get_value(row[2])
                ))
            return likes
        except Exception as e:
            print(f"Error getting user likes: {e}")
            return []
        finally:
            cursor.close()

    # 5. 스토리 좋아요 수 조회
    def get_like_count(self, story_id: int):
        cursor = self.db.cursor()
        try:
            sql = "SELECT COUNT(*) FROM LIKE_T WHERE story_id = :1"
            cursor.execute(sql, (story_id,))
            return cursor.fetchone()[0]
        except Exception as e:
            print(f"Error counting likes: {e}")
            return 0
        finally:
            cursor.close()