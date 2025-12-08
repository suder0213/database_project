from fastapi import APIRouter, HTTPException
from Service.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["stats"])
stats_service = StatsService()

@router.get("/users/{user_id}/stats")
def get_user_stats(user_id: int):
    return stats_service.get_user_stats(user_id)

@router.get("/stories/popular")
def get_popular_stories(min_likes: int = 0):
    return stats_service.get_popular_stories(min_likes)

@router.get("/places/high-rated")
def get_high_rated_places(min_rating: float = 0):
    return stats_service.get_high_rated_places(min_rating)

@router.get("/reviews/search/place")
def search_reviews_by_place(place_name: str):
    return stats_service.search_reviews_by_place(place_name)

@router.get("/reviews/excellent")
def get_excellent_reviews(threshold: float = 1.5):
    return stats_service.get_excellent_reviews(threshold)

@router.get("/places/{place_id}/hot-reviews")
def get_hot_reviews(place_id: int):
    return stats_service.get_hot_reviews(place_id)

@router.get("/reviews/by-rating")
def get_reviews_by_rating(rating: float):
    return stats_service.get_reviews_by_rating(rating)

@router.get("/places/search/name")
def search_places_by_name(name: str):
    return stats_service.search_places_by_name(name)
