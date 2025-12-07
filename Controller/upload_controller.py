from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
from pathlib import Path
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 파일 확장자 확인
        ext = file.filename.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다")
        
        # 고유 파일명 생성
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = Path("static/images") / filename
        
        # 파일 저장
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # URL 반환
        return {"success": True, "url": f"/static/images/{filename}"}
    
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="파일 업로드 실패")
