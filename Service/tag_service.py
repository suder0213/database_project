from Enitity.Tag import Tag
import oracledb

class TagService:
    def __init__(self, db: oracledb.Connection):
        self.db = db
    
    # 새 태그 생성
    def create_tag(self, tag_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO TAG (tag_id, name) VALUES (TAG_SEQ.NEXTVAL, :1)"
            cursor.execute(sql, (tag_data['name'],))
            self.db.commit()
            return True
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error creating tag: {e}")
            return False
        finally:
            cursor.close()
    
    # 태그 ID로 태그 조회
    def get_tag_by_id(self, tag_id: int):
        cursor = self.db.cursor()
        try:
            sql = "SELECT tag_id, name FROM TAG WHERE tag_id = :1"
            cursor.execute(sql, (tag_id,))
            row = cursor.fetchone()
            if row:
                return Tag(*row)
            return None
        except Exception as e:
            print(f"Error getting tag: {e}")
            return None
        finally:
            cursor.close()
    
    # 모든 태그 목록 조회
    def get_all_tags(self):
        cursor = self.db.cursor()
        try:
            sql = "SELECT tag_id, name FROM TAG"
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [Tag(*row) for row in rows]
        except Exception as e:
            print(f"Error getting all tags: {e}")
            return []
        finally:
            cursor.close()
    
    # 스토리에 태그 추가
    def add_story_tag(self, story_id: int, tag_id: int):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO STORY_TAG (story_id, tag_id) VALUES (:1, :2)"
            cursor.execute(sql, (story_id, tag_id))
            self.db.commit()
            return True
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error adding story tag: {e}")
            return False
        finally:
            cursor.close()
    
    # 스토리에서 태그 제거
    def remove_story_tag(self, story_id: int, tag_id: int):
        cursor = self.db.cursor()
        try:
            sql = "DELETE FROM STORY_TAG WHERE story_id = :1 AND tag_id = :2"
            cursor.execute(sql, (story_id, tag_id))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error removing story tag: {e}")
            return False
        finally:
            cursor.close()
    
    # 스토리의 태그 목록 조회
    def get_story_tags(self, story_id: int):
        cursor = self.db.cursor()
        try:
            sql = """SELECT t.tag_id, t.name FROM TAG t 
                     JOIN STORY_TAG st ON t.tag_id = st.tag_id 
                     WHERE st.story_id = :1"""
            cursor.execute(sql, (story_id,))
            rows = cursor.fetchall()
            return [Tag(*row) for row in rows]
        except Exception as e:
            print(f"Error getting story tags: {e}")
            return []
        finally:
            cursor.close()
    
    # 태그별 스토리 ID 목록 조회
    def get_stories_by_tag(self, tag_id: int):
        cursor = self.db.cursor()
        try:
            sql = """SELECT story_id FROM STORY_TAG WHERE tag_id = :1"""
            cursor.execute(sql, (tag_id,))
            rows = cursor.fetchall()
            return [row[0] for row in rows]
        except Exception as e:
            print(f"Error getting stories by tag: {e}")
            return []
        finally:
            cursor.close()
    
    # 모든 태그 목록 (프론트엔드 응답 형식)
    def get_all_tags_for_frontend(self):
        tags = self.get_all_tags()
        
        tags_data = []
        for tag in tags:
            tags_data.append({
                "tag_id": tag.tag_id,
                "name": tag.name
            })
        
        return {"tags": tags_data}
    
    # 스토리별 태그 목록 (프론트엔드 응답 형식)
    def get_story_tags_for_frontend(self, story_id: int):
        tags = self.get_story_tags(story_id)
        
        tags_data = []
        for tag in tags:
            tags_data.append({
                "tag_id": tag.tag_id,
                "name": tag.name
            })
        
        return {"tags": tags_data}
    
    # 태그명으로 스토리에 태그 추가
    # 1. 태그가 존재하면 해당 tag_id 사용
    # 2. 태그가 없으면 새로 생성 후 사용
    def add_tag_to_story_by_name(self, story_id: int, tag_name: str):
        cursor = self.db.cursor()
        try:
            # 1단계: 태그 존재 여부 확인
            sql = "SELECT tag_id FROM TAG WHERE name = :1"
            cursor.execute(sql, (tag_name,))
            row = cursor.fetchone()
            
            if row:
                # 기존 태그 사용
                tag_id = row[0]
            else:
                # 새 태그 생성
                sql = "INSERT INTO TAG (tag_id, name) VALUES (TAG_SEQ.NEXTVAL, :1) RETURNING tag_id INTO :2"
                tag_id_var = cursor.var(int)
                cursor.execute(sql, (tag_name, tag_id_var))
                tag_id = tag_id_var.getvalue()[0]
            
            # 2단계: 중복 체크
            sql = "SELECT COUNT(*) FROM STORY_TAG WHERE story_id = :1 AND tag_id = :2"
            cursor.execute(sql, (story_id, tag_id))
            count = cursor.fetchone()[0]
            
            if count > 0:
                # 이미 연결된 태그
                self.db.commit()  # 태그 생성은 커밋
                return {"success": False, "message": "이미 추가된 태그입니다."}
            
            # 3단계: 스토리에 태그 연결
            sql = "INSERT INTO STORY_TAG (story_id, tag_id) VALUES (:1, :2)"
            cursor.execute(sql, (story_id, tag_id))
            self.db.commit()
            return {"success": True, "message": "태그가 추가되었습니다."}
                
        except Exception as e:
            print(f"Error adding tag to story: {e}")
            self.db.rollback()
            return {"success": False, "message": "태그 추가에 실패했습니다."}
        finally:
            cursor.close()