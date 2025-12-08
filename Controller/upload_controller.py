from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
from pathlib import Path
import uuid

# [삭제] import oracledb  <-- DB를 안 쓰므로 삭제
# [삭제] from database import get_db <-- DB를 안 쓰므로 삭제

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 1. 파일 확장자 확인
        filename_original = file.filename if file.filename else "unknown"
        ext = filename_original.split('.')[-1].lower()
        
        if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다 (jpg, jpeg, png, gif, webp)")
        
        # 2. 고유 파일명 생성
        new_filename = f"{uuid.uuid4()}.{ext}"
        
        # 3. 저장 경로 설정 (static/images)
        save_path = Path("static/images")
        
        # [추가] 폴더가 없으면 에러가 나므로, 자동으로 생성해주는 코드 추가
        save_path.mkdir(parents=True, exist_ok=True)
        
        filepath = save_path / new_filename
        
        # 4. 파일 저장
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 5. URL 반환
        return {"success": True, "url": f"/static/images/{new_filename}"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="파일 업로드 실패")