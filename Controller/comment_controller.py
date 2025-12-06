from fastapi import APIRouter, HTTPException
from Service.comment_service import CommentService
from Enitity.Comment_t.dto.comment_create_dto import CommentCreateDto
from Enitity.Comment_t.dto.comment_update_dto import CommentUpdateDto

router = APIRouter(prefix="/comments", tags=["comments"])
comment_service = CommentService()

# 1. 댓글 작성
@router.post("")
def create_comment(comment_data: CommentCreateDto):
    comment_id = comment_service.create_comment(comment_data.model_dump())
    if comment_id:
        return {"success": True, "comment_id": comment_id}
    raise HTTPException(status_code=400, detail="Failed to create comment")

# 2. 댓글 조회
@router.get("/{comment_id}")
def get_comment(comment_id: int):
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
def get_review_comments(review_id: int):
    comments = comment_service.get_comments_by_review(review_id)
    return {
        "comments": [
            {
                "comment_id": c.comment_id,
                "content": c.content,
                "user_name": c.user_name,
                "created_at": c.created_at
            } for c in comments
        ]
    }

# 4. 사용자별 댓글 목록
@router.get("/user/{user_id}")
def get_user_comments(user_id: int):
    comments = comment_service.get_comments_by_user(user_id)
    return {
        "comments": [
            {
                "comment_id": c.comment_id,
                "content": c.content,
                "review_title": c.review_title,
                "created_at": c.created_at
            } for c in comments
        ]
    }

# 5. 댓글 수정
@router.put("/{comment_id}")
def update_comment(comment_id: int, comment_data: CommentUpdateDto):
    success = comment_service.update_comment(comment_id, comment_data.content)
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Comment not found")

# 6. 댓글 삭제
@router.delete("/{comment_id}")
def delete_comment(comment_id: int):
    success = comment_service.delete_comment(comment_id)
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Comment not found")