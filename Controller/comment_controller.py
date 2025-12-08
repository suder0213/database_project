from fastapi import APIRouter, HTTPException, Depends # Depends 추가
import oracledb
from database import get_db
from Service.comment_service import CommentService
from Enitity.Comment_t.dto.comment_create_dto import CommentCreateDto
from Enitity.Comment_t.dto.comment_update_dto import CommentUpdateDto

router = APIRouter(prefix="/comments", tags=["comments"])

# [삭제] comment_service = CommentService() <-- 전역 변수는 이제 사용하지 않습니다.

# 1. 댓글 작성
@router.post("")
def create_comment(
    comment_data: CommentCreateDto,
    db: oracledb.Connection = Depends(get_db) # [추가] DB 연결 빌리기
):
    comment_service = CommentService(db) # [추가] 서비스에 DB 주입
    
    comment_id = comment_service.create_comment(comment_data.model_dump())
    if comment_id:
        return {"success": True, "comment_id": comment_id}
    raise HTTPException(status_code=400, detail="Failed to create comment")

# 2. 댓글 조회
@router.get("/{comment_id}")
def get_comment(
    comment_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    comment_service = CommentService(db) # [추가]
    
    comment = comment_service.get_comment_by_id(comment_id)
    if comment:
        return {
            "comment_id": comment.comment_id,
            "content": comment.content,
            "user_name": comment.user_name,
            "review_id": comment.review_id,
            "created_at": comment.created_at
        }
    raise HTTPException(status_code=404, detail="Comment not found")

# 3. 리뷰별 댓글 목록
@router.get("/review/{review_id}")
def get_review_comments(
    review_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    comment_service = CommentService(db) # [추가]
    
    comments = comment_service.get_comments_by_review(review_id)
    return {
        "comments": [
            {
                "comment_id": c.comment_id,
                "content": c.content,
                "user_id": c.user_id,
                "user_name": c.user_name,
                "created_at": c.created_at
            } for c in comments
        ]
    }

# 4. 사용자별 댓글 목록
@router.get("/user/{user_id}")
def get_user_comments(
    user_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    comment_service = CommentService(db) # [추가]
    
    comments = comment_service.get_comments_by_user(user_id)
    return {
        "comments": [
            {
                "comment_id": c.comment_id,
                "content": c.content,
                "review_id": c.review_id,
                "review_title": c.review_title,
                "place_id": c.place_id if hasattr(c, 'place_id') else None,
                "place_name": c.place_name if hasattr(c, 'place_name') else None,
                "latitude": c.latitude if hasattr(c, 'latitude') else None,
                "longitude": c.longitude if hasattr(c, 'longitude') else None,
                "created_at": c.created_at
            } for c in comments
        ]
    }

# 5. 댓글 수정
@router.put("/{comment_id}")
def update_comment(
    comment_id: int, 
    comment_data: CommentUpdateDto,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    comment_service = CommentService(db) # [추가]
    
    success = comment_service.update_comment(comment_id, comment_data.content)
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Comment not found")

# 6. 댓글 삭제
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    comment_service = CommentService(db) # [추가]
    
    success = comment_service.delete_comment(comment_id)
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Comment not found")