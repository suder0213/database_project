import oracledb
import os
from typing import Optional

class Database:
    def __init__(self):
        # 1. DB 연결 정보 설정
        # 로컬 테스트 시: "localhost", Docker 실행 시: "host.docker.internal"
        self.host = "localhost"  
        
        # 포트 번호 (사용자 환경에 맞게 1521 또는 1522 설정)
        self.port = 1522         
        
        # SID 또는 Service Name
        self.sid = "orcl"        
        
        # 계정 정보
        self.username = "ruen"
        self.password = "team14_password"
        
        self.pool: Optional[oracledb.ConnectionPool] = None

    def create_pool(self):
        """애플리케이션 시작 시 커넥션 풀 생성"""
        try:
            # DSN(Data Source Name) 생성
            dsn = oracledb.makedsn(self.host, self.port, sid=self.sid)
            
            # [수정됨] 에러가 발생하던 getmode 옵션을 제거했습니다.
            # oracledb는 기본적으로 연결이 꽉 차면 대기(Wait)하도록 설정되어 있습니다.
            self.pool = oracledb.create_pool(
                user=self.username,
                password=self.password,
                dsn=dsn,
                min=2,       # 최소 유지 연결 수
                max=10,      # 최대 허용 연결 수
                increment=1  # 부족할 때 늘리는 단위
            )
            print("✅ Oracle DB Connection Pool created successfully (oracledb).")
        except oracledb.Error as e:
            print(f"❌ Failed to create DB pool: {e}")
            raise e

    def close_pool(self):
        """애플리케이션 종료 시 커넥션 풀 정리"""
        if self.pool:
            self.pool.close()
            print("🛑 DB Connection Pool closed.")

    def get_connection(self):
        """풀에서 커넥션 하나를 빌려옴"""
        if not self.pool:
            self.create_pool()
        return self.pool.acquire()

    def release_connection(self, connection):
        """사용 후 커넥션을 풀에 반납"""
        if self.pool and connection:
            self.pool.release(connection)

# 전역 Database 객체 생성
db = Database()

# ---------------------------------------------------------
# [중요] FastAPI Depends에서 사용할 의존성 주입 함수
# Controller에서 사용법: db: oracledb.Connection = Depends(get_db)
# ---------------------------------------------------------
def get_db():
    # 1. 풀이 없으면 생성 (혹시 모를 안전장치)
    if db.pool is None:
        db.create_pool()
    
    # 2. 연결 빌리기
    connection = db.get_connection()
    try:
        yield connection
        # 필요하다면 여기서 commit을 할 수도 있지만, 
        # 명시적인 제어를 위해 Service 계층에서 commit 하는 것을 권장합니다.
    except Exception as e:
        connection.rollback() # 에러 발생 시 롤백
        raise e
    finally:
        # 3. 작업이 끝나면 무조건 풀로 반납 (연결 종료 아님, 재사용 대기 상태로 변경)
        db.release_connection(connection)