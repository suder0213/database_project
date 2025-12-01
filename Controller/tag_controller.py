from fastapi import APIRouter, HTTPException
from Service.tag_service import TagService
from Enitity.Tag import TagCreateDto, StoryTagAddDto, StoryTagCreateDto

router = APIRouter(prefix="/tags", tags=["tags"])
tag_service = TagService()

@router.get("")
def get_all_tags():
    result = tag_service.get_all_tags_for_frontend()
    if result:
        return result
    raise HTTPException(status_code=404, detail="No tags found")

@router.post("/story/{story_id}")
def add_story_tag(story_id: int, tag_data: StoryTagCreateDto):
    result = tag_service.add_tag_to_story_by_name(story_id, tag_data.tag_name)
    if result:
        return {"success": True}
    raise HTTPException(status_code=400, detail="Failed to add tag to story")

@router.get("/story/{story_id}")
def get_story_tags(story_id: int):
    result = tag_service.get_story_tags_for_frontend(story_id)
    if result:
        return result
    raise HTTPException(status_code=404, detail="No tags found for story")

# 기존 API들 (확장성을 위해 유지)
@router.post("")
def create_tag(tag_data: TagCreateDto):
    result = tag_service.create_tag(tag_data.model_dump())
    if result:
        return {"message": "Tag created successfully"}
    raise HTTPException(status_code=400, detail="Failed to create tag")

@router.get("/{tag_id}")
def get_tag_details(tag_id: int):
    tag = tag_service.get_tag_by_id(tag_id)
    if tag:
        return tag.__dict__
    raise HTTPException(status_code=404, detail="Tag not found")

@router.delete("/story/{story_id}/tag/{tag_id}")
def remove_story_tag(story_id: int, tag_id: int):
    result = tag_service.remove_story_tag(story_id, tag_id)
    if result:
        return {"message": "Tag removed from story successfully"}
    raise HTTPException(status_code=404, detail="Tag not found in story")

@router.get("/{tag_id}/stories")
def search_stories_by_tag(tag_id: int):
    story_ids = tag_service.get_stories_by_tag(tag_id)
    return {"tag_id": tag_id, "story_ids": story_ids}