Team 14 Database Project - 실행 방법

=== Docker를 사용한 실행 방법 ===

1. 사전 준비
   - Docker Desktop 설치 및 실행 필요
   - Oracle DB 서버가 실행 중이어야 함

2. 데이터베이스 연결 설정
   database.py 파일에서 Oracle DB 연결 정보를 실제 환경에 맞게 수정:
   - host: Oracle DB 서버 IP 주소
   - port: 1521
   - service_name: xe 또는 orcl
   - username: 실제 사용자명
   - password: 실제 비밀번호

3. Docker Compose 실행
   프로젝트 루트 디렉토리에서 다음 명령어 실행:
   
   docker-compose up --build
   
   백그라운드 실행을 원하는 경우:
   docker-compose up -d --build

4. 접속 확인
   - 백엔드 API: http://localhost:8000
   - 프론트엔드: http://localhost:3000
   - API 문서: http://localhost:8000/docs

5. 종료
   docker-compose down

6. 문제 발생 시 캐시 삭제 후 재실행
   docker-compose down -v
   docker system prune -f
   docker-compose up --build

=== 로그 확인 방법 ===
   전체 로그: docker-compose logs
   실시간 로그: docker-compose logs -f
   백엔드만: docker-compose logs -f backend
   프론트엔드만: docker-compose logs -f frontend

=== 주의사항 ===
- Oracle DB가 미리 실행되어 있어야 함
- 필요한 테이블들이 생성되어 있어야 함
- 테이블명은 대문자 사용: USER_T, PLACE, REVIEW, STORY, COMMENT_T, LIKE_T, TAG, STORY_TAG
- 백엔드(8000포트)와 프론트엔드(3000포트) 모두 정상 실행되어야 함