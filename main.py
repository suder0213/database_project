from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from Controller.user_controller import router as user_router
from Controller.place_controller import router as place_router
from Controller.review_controller import router as review_router
from Controller.story_controller import router as story_router
from Controller.comment_controller import router as comment_router
from Controller.like_controller import router as like_router
from Controller.tag_controller import router as tag_router
from Controller.upload_controller import router as upload_router
from Controller.stats_controller import router as stats_router

from contextlib import asynccontextmanager
from database import db

# [추가] 수명주기 관리 (서버 켜질 때 풀 만들고, 꺼질 때 닫기)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Server starting... Connecting to DB")
    db.create_pool() # 풀 생성
    yield
    print("🛑 Server shutting down... Closing DB connection")
    db.close_pool() # 풀 닫기

app = FastAPI(lifespan=lifespan) # lifespan 등록
# Static 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS 설정 (프론트엔드 연동을 위해 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(user_router)
app.include_router(place_router)
app.include_router(review_router)
app.include_router(story_router)
app.include_router(comment_router)
app.include_router(like_router)
app.include_router(tag_router)
app.include_router(upload_router)
app.include_router(stats_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)