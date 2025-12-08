from Enitity.User_t import User_t
from datetime import datetime
import oracledb

class UserService:
    def __init__(self, db: oracledb.Connection):
        self.db = db
    
    # 새 사용자 생성
    def create_user(self, user_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO USER_T (user_id, id, password, name, email) VALUES (USER_SEQ.NEXTVAL, :1, :2, :3, :4)"
            cursor.execute(sql, (user_data['id'], user_data['password'], 
                               user_data['name'], user_data['email']))
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False
        finally:
            cursor.close()
    
    # 새 사용자 생성하고 user_id 반환
    def create_user_and_return_id(self, user_data: dict):
        cursor = self.db.cursor()
        try:
            sql = "INSERT INTO USER_T (user_id, id, password, name, email) VALUES (USER_SEQ.NEXTVAL, :1, :2, :3, :4) RETURNING user_id INTO :5"
            user_id_var = cursor.var(int)
            cursor.execute(sql, (user_data['id'], user_data['password'], 
                               user_data['name'], user_data['email'], user_id_var))
            self.db.commit()
            return user_id_var.getvalue()[0]
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
        finally:
            cursor.close()
    
    # 사용자 ID로 사용자 조회
    def get_user_by_id(self, user_id: int):
        cursor = self.db.cursor()
        try:
            sql = "SELECT user_id, id, password, name, email, created_at FROM USER_T WHERE user_id = :1"
            cursor.execute(sql, (user_id,))
            row = cursor.fetchone()
            if row:
                return User_t(*row)
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
        finally:
            cursor.close()
    
    # 로그인 ID로 사용자 조회
    def get_user_by_login_id(self, login_id: str):
        cursor = self.db.cursor()
        try:
            sql = "SELECT user_id, id, password, name, email, created_at FROM USER_T WHERE id = :1"
            cursor.execute(sql, (login_id,))
            row = cursor.fetchone()
            if row:
                return User_t(*row)
            return None
        except Exception as e:
            print(f"Error getting user by login_id: {e}")
            return None
        finally:
            cursor.close()
    
    # 사용자 정보 수정
    def update_user(self, user_id: int, user_data: dict):
        cursor = self.db.cursor()
        try:
            if 'password' in user_data and user_data['password']:
                sql = "UPDATE USER_T SET name = :1, email = :2, password = :3 WHERE user_id = :4"
                cursor.execute(sql, (user_data['name'], user_data['email'], user_data['password'], user_id))
            else:
                sql = "UPDATE USER_T SET name = :1, email = :2 WHERE user_id = :3"
                cursor.execute(sql, (user_data['name'], user_data['email'], user_id))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating user: {e}")
            return False
        finally:
            cursor.close()
    
    # 사용자 삭제
    def delete_user(self, user_id: int):
        cursor = self.db.cursor()
        try:
            sql = "DELETE FROM USER_T WHERE user_id = :1"
            cursor.execute(sql, (user_id,))
            self.db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False
        finally:
            cursor.close()
    
    # 사용자 인증 (로그인)
    def authenticate_user(self, login_id: str, password: str):
        user = self.get_user_by_login_id(login_id)
        if user and user.password == password:
            return user
        return None