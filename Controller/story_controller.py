from fastapi import APIRouter, HTTPException, Query
from Service.story_service import StoryService
from Enitity.Story.dto.story_create_dto import StoryCreateDto

router = APIRouter(prefix="/stories", tags=["stories"])
story_service = StoryService()

# 1. 스토리 작성 (POST /stories)
@router.post("")
def create_story(story_data: StoryCreateDto):
    # 명세서: { "success": true, "story_id": 456 }
    created_id = story_service.create_story(story_data.model_dump())
    
    if created_id:
        return {"success": True, "story_id": created_id}
    
    raise HTTPException(status_code=400, detail="Failed to create story")

# 2. 맵에서 스토리 보기 (GET /stories/location/search)
@router.get("/location/search")
def search_stories(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(1.0)
):
    # 명세서: { "stories": [...] }
    stories = story_service.search_stories_by_location(lat, lng, radius)
    return story_service.format_stories_response(stories)

# 3. 내가 쓴 스토리 보기 (GET /stories/user/{user_id})
@router.get("/user/{user_id}")
def get_user_stories(user_id: int):
    # 명세서: { "stories": [...] }
    stories = story_service.get_stories_by_user(user_id)
    return story_service.format_stories_response(stories)