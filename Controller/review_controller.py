from fastapi import APIRouter, HTTPException
from Service.review_service import ReviewService
from Enitity.Review.dto.review_create_dto import ReviewCreateDto
from Enitity.Review.dto.review_update_dto import ReviewUpdateDto

router = APIRouter(prefix="/reviews", tags=["reviews"])
review_service = ReviewService()

# 1. 리뷰 작성
@router.post("")
def create_review(review_data: ReviewCreateDto):
    review_id = review_service.create_review(review_data.model_dump())
    if review_id:
        return {"success": True, "review_id": review_id}
    raise HTTPException(status_code=400, detail="Failed to create review")

# 2. 리뷰 상세 조회 (단건)
@router.get("/{review_id}")
def get_review(review_id: int):
    review = review_service.get_review_by_id(review_id)
    if review:
        return {
            "review_id": review.review_id,
            "title": review.title,
            "content": review.content,
            "rating": review.rating,
            "user_name": review.user_name,
            "place_name": review.place_name,
            "created_at": review.created_at
        }
    raise HTTPException(status_code=404, detail="Review not found")

# 3. 장소별 리뷰 목록
@router.get("/place/{place_id}")
def get_place_reviews(place_id: int):
    reviews = review_service.get_reviews_by_place(place_id)
    return {
        "reviews": [
            {
                "review_id": r.review_id,
                "title": r.title,
                "content": r.content,
                "rating": r.rating,
                "user_id": r.user_id,
                "user_name": r.user_name,
                "created_at": r.created_at
            } for r in reviews
        ]
    }

# 4. 사용자별 리뷰 목록 (좌표 포함)
@router.get("/user/{user_id}")
def get_user_reviews(user_id: int):
    reviews = review_service.get_reviews_by_user(user_id)
    return {
        "reviews": [
            {
                "review_id": r.review_id,
                "title": r.title,
                "content": r.content,
                "rating": r.rating,
                "place_id": r.place_id,
                "place_name": r.place_name,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "created_at": r.created_at
            } for r in reviews
        ]
    }

# 5. 리뷰 수정
@router.put("/{review_id}")
def update_review(review_id: int, review_data: ReviewUpdateDto):
    success = review_service.update_review(review_id, review_data.model_dump())
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Review not found or update failed")

# 6. 리뷰 삭제
@router.delete("/{review_id}")
def delete_review(review_id: int):
    success = review_service.delete_review(review_id)
    if success:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Review not found or delete failed")