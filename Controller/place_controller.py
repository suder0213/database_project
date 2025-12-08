from fastapi import APIRouter, HTTPException, Query, Depends # Depends 추가
from Service.place_service import PlaceService
from Enitity.Place import PlaceCreateDto, PlaceUpdateDto

import oracledb
from database import get_db

router = APIRouter(prefix="/places", tags=["places"])

# [삭제] place_service = PlaceService() <-- 전역 변수 사용 안 함

@router.post("")
def create_place(
    place_data: PlaceCreateDto,
    db: oracledb.Connection = Depends(get_db) # [추가] DB 연결 주입
):
    place_service = PlaceService(db) # [추가] 서비스 생성
    
    place_id = place_service.create_place_and_return_id(place_data.model_dump())
    if place_id:
        return {"success": True, "place_id": place_id}
    raise HTTPException(status_code=400, detail="Failed to create place")

@router.get("/{place_id}")
def get_place_details(
    place_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    place = place_service.get_place_by_id(place_id)
    if place:
        return place.__dict__
    raise HTTPException(status_code=404, detail="Place not found")

@router.get("/search/location")
def search_places_by_location(
    lat: float = Query(...), 
    lng: float = Query(...), 
    radius: float = Query(1.0),
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    result = place_service.search_places_for_frontend(lat, lng, radius)
    if result:
        return result
    raise HTTPException(status_code=404, detail="No places found")

@router.get("/search/bounds")
def search_places_by_bounds(
    sw_lat: float = Query(...),
    sw_lng: float = Query(...),
    ne_lat: float = Query(...),
    ne_lng: float = Query(...),
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    result = place_service.search_places_by_bounds(sw_lat, sw_lng, ne_lat, ne_lng)
    return result

@router.put("/{place_id}")
def update_place_info(
    place_id: int, 
    place_data: PlaceUpdateDto,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    result = place_service.update_place(place_id, place_data.model_dump())
    if result:
        return {"message": "Place updated successfully"}
    raise HTTPException(status_code=404, detail="Place not found")

@router.delete("/{place_id}")
def delete_place(
    place_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    result = place_service.delete_place(place_id)
    if result:
        return {"message": "Place deleted successfully"}
    raise HTTPException(status_code=404, detail="Place not found")

@router.put("/{place_id}/rating")
def update_place_rating(
    place_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    place_service = PlaceService(db) # [추가]
    
    result = place_service.update_average_rating(place_id)
    if result:
        return {"message": "Place rating updated successfully"}
    raise HTTPException(status_code=404, detail="Place not found")