from Enitity.Comment_t.comment_t import Comment_t
from datetime import datetime
import oracledb

class CommentService:
    def __init__(self, db: oracledb.Connection):
        self.db = db

    # LOB 데이터 처리 헬퍼 (필수)
    def _get_value(self, val):
        if isinstance(val, oracledb.LOB):
            return val.read()
        return val

    # 1. 댓글 작성
    def create_comment(self, comment_data: dict):
        cursor = self.db.cursor()
        try:
            sql = """
                INSERT INTO COMMENT_T (comment_id, user_id, review_id, content, created_at) 
                VALUES (COMMENT_SEQ.NEXTVAL, :1, :2, :3, SYSDATE)
                RETURNING comment_id INTO :4
            """
            comment_id_var = cursor.var(int)
            cursor.execute(sql, (
                comment_data['user_id'],
                comment_data['review_id'],
                comment_data['content'],
                comment_id_var
            ))
            self.db.commit()
            return comment_id_var.getvalue()[0]
        except Exception as e:
            print(f"Error creating comment: {e}")
            return None
        finally:
            cursor.close()

    # 2. 댓글 단건 조회
    def get_comment_by_id(self, comment_id: int):
        cursor = self.db.cursor()
        try:
            # 명세서: user_name 필요
            sql = """
                SELECT c.comment_id, c.review_id, c.content, c.created_at, u.name
                FROM COMMENT_T c
                JOIN USER_T u ON c.user_id = u.user_id
                WHERE c.comment_id = :1
            """
            cursor.execute(sql, (comment_id,))
            row = cursor.fetchone()
            
            if row:
                return Comment_t(
                    comment_id=row[0],
                    review_id=row[1],
                    content=self._get_value(row[2]), # LOB 처리
                    created_at=row[3],
                    user_name=row[4]
                )
            return None
        except Exception as e:
            print(f"Error getting comment: {e}")
            return None
        finally:
            cursor.close()

    # 3. 리뷰별 댓글 목록 조회
    def get_comments_by_review(self, review_id: int):
        cursor = self.db.cursor()
        try:
            sql = """
                SELECT c.comment_id, c.content, c.created_at, c.user_id, u.name
                FROM COMMENT_T c
                JOIN USER_T u ON c.user_id = u.user_id
                WHERE c.review_id = :1
                ORDER BY c.created_at ASC
            """
            cursor.execute(sql, (review_id,))
            rows = cursor.fetchall()
            
            comments = []
            for row in rows:
                comments.append(Comment_t(
                    comment_id=row[0],
                    content=self._get_value(row[1]),
                    created_at=row[2],
                    user_id=row[3],
                    user_name=row[4]
                ))
            return comments
        except Exception as e:
            print(f"Error getting review comments: {e}")
            return []
        finally:
            cursor.close()

    # 4. 사용자별 댓글 목록 조회 (리뷰 제목 포함)
    def get_comments_by_user(self, user_id: int):
        cursor = self.db.cursor()
        try:
            # REVIEW 테이블과 조인하여 review_title(r.title) 가져오기
            sql = """
                SELECT c.comment_id, c.content, c.created_at, r.title, c.review_id,
                       r.place_id, p.name, p.latitude, p.longitude
                FROM COMMENT_T c
                JOIN REVIEW r ON c.review_id = r.review_id
                LEFT JOIN PLACE p ON r.place_id = p.place_id
                WHERE c.user_id = :1
                ORDER BY c.created_at DESC
            """
            cursor.execute(sql, (user_id,))
            rows = cursor.fetchall()
            
            comments = []
            for row in rows:
                comments.append(Comment_t(
                    comment_id=row[0],
                    content=self._get_value(row[1]),
                    created_at=row[2],
                    review_title=self._get_value(row[3]),
                    review_id=row[4],
                    place_id=row[5],
                    place_name=self._get_value(row[6]) if row[6] else None,
                    latitude=row[7],
                    longitude=row[8]
                ))
            return comments
        except Exception as e:
            print(f"Error getting user comments: {e}")
            return []
        finally:
            cursor.close()

    # 5. 댓글 수정
    def update_comment(self, comment_id: int, content: str):
        cursor = self.db.cursor()
        try:
            sql = "UPDATE COMMENT_T SET content = :1 WHERE comment_id = :2"
            cursor.execute(sql, (content, comment_id))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating comment: {e}")
            return False
        finally:
            cursor.close()

    # 6. 댓글 삭제
    def delete_comment(self, comment_id: int):
        cursor = self.db.cursor()
        try:
            sql = "DELETE FROM COMMENT_T WHERE comment_id = :1"
            cursor.execute(sql, (comment_id,))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting comment: {e}")
            return False
        finally:
            cursor.close()