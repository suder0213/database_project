from fastapi import APIRouter, HTTPException, Depends # Depends 추가
from Service.stats_service import StatsService

import oracledb
from database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])

# [삭제] stats_service = StatsService() <-- 전역 변수 삭제

@router.get("/users/{user_id}/stats")
def get_user_stats(
    user_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_user_stats(user_id)

@router.get("/stories/popular")
def get_popular_stories(
    min_likes: int = 0,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_popular_stories(min_likes)

@router.get("/places/high-rated")
def get_high_rated_places(
    min_rating: float = 0,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_high_rated_places(min_rating)

@router.get("/reviews/search/place")
def search_reviews_by_place(
    place_name: str,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.search_reviews_by_place(place_name)

@router.get("/reviews/excellent")
def get_excellent_reviews(
    threshold: float = 1.5,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_excellent_reviews(threshold)

@router.get("/places/{place_id}/hot-reviews")
def get_hot_reviews(
    place_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_hot_reviews(place_id)

@router.get("/reviews/by-rating")
def get_reviews_by_rating(
    rating: float,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.get_reviews_by_rating(rating)

@router.get("/places/search/name")
def search_places_by_name(
    name: str,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    stats_service = StatsService(db) # [추가]
    return stats_service.search_places_by_name(name)