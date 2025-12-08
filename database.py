import oracledb
from typing import Optional


class DatabaseConnection:
    def __init__(self):
        self.host = "host.docker.internal"
        self.port = 1521
        self.service_name = "orcl"
        self.username = "team14_user"  # 실제 사용자명으로 변경
        self.password = "team14_password"  # 실제 비밀번호로 변경
        self.connection: Optional[oracledb.Connection] = None

    def connect(self):
        try:
            dsn = oracledb.makedsn(
                self.host, self.port, service_name=self.service_name
            )
            self.connection = oracledb.connect(user=self.username, password=self.password, dsn=dsn)
            return self.connection
        except oracledb.Error as e:
            print(f"Database connection error: {e}")
            return None

    def disconnect(self):
        if self.connection:
            self.connection.close()
            self.connection = None

    def get_cursor(self):
        try:
            if not self.connection or not self.connection.is_healthy():
                self.connect()
            return self.connection.cursor() if self.connection else None
        except:
            self.connect()
            return self.connection.cursor() if self.connection else None


db_connection = DatabaseConnection()
