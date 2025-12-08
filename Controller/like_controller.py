from fastapi import APIRouter, HTTPException, Depends
import oracledb
from database import get_db
from Service.like_service import LikeService
from Enitity.Like_t.dto.like_toggle_dto import LikeToggleDto

router = APIRouter(prefix="/likes", tags=["likes"])

# [삭제] like_service = LikeService() <-- 전역 변수 삭제

# 1. 좋아요 토글
@router.post("/toggle")
def toggle_like(
    data: LikeToggleDto,
    db: oracledb.Connection = Depends(get_db) # [추가] DB 연결 주입
):
    like_service = LikeService(db) # [추가] 서비스 생성
    
    result = like_service.toggle_like(data.user_id, data.story_id)
    if result:
        return {
            "success": True, 
            "liked": result["liked"], 
            "total_likes": result["total_likes"]
        }
    raise HTTPException(status_code=400, detail="Failed to toggle like")

# 2. 좋아요 상태 확인
@router.get("/check/{user_id}/{story_id}")
def check_like_status(
    user_id: int, 
    story_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    like_service = LikeService(db) # [추가]

    is_liked = like_service.check_like_status(user_id, story_id)
    return {"success": True, "liked": is_liked}

# 3. 스토리별 좋아요 목록
@router.get("/story/{story_id}")
def get_story_likes(
    story_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    like_service = LikeService(db) # [추가]

    likes = like_service.get_likes_by_story(story_id)
    return {
        "likes": [
            {
                "user_id": l.user_id,
                "user_name": l.user_name,
                "created_at": l.created_at
            } for l in likes
        ]
    }

# 4. 사용자별 좋아요 목록
@router.get("/user/{user_id}")
def get_user_likes(
    user_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    like_service = LikeService(db) # [추가]

    likes = like_service.get_likes_by_user(user_id)
    return {
        "liked_stories": [
            {
                "story_id": l.story_id,
                "content": l.story_content,
                "created_at": l.created_at
            } for l in likes
        ]
    }

# 5. 스토리 좋아요 수
@router.get("/story/{story_id}/count")
def get_like_count(
    story_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    like_service = LikeService(db) # [추가]

    count = like_service.get_like_count(story_id)
    return {"story_id": story_id, "total_likes": count}