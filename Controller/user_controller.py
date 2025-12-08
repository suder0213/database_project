from fastapi import APIRouter, HTTPException, Depends # Depends 추가
from Service.user_service import UserService
from Enitity.User_t import UserCreateDto, UserLoginDto, UserUpdateDto

import oracledb
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])

# [삭제] user_service = UserService() <-- 전역 변수 삭제

@router.post("/register")
def register_user(
    user_data: UserCreateDto,
    db: oracledb.Connection = Depends(get_db) # [추가] DB 연결 주입
):
    user_service = UserService(db) # [추가] 서비스 생성
    
    user_id = user_service.create_user_and_return_id(user_data.model_dump())
    if user_id:
        return {"success": True, "user_id": user_id}
    raise HTTPException(status_code=400, detail="Failed to register user")

@router.post("/login")
def login_user(
    login_data: UserLoginDto,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    user_service = UserService(db) # [추가]
    
    user = user_service.authenticate_user(login_data.id, login_data.password)
    if user:
        return {"message": "Login successful", "user_id": user.user_id}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/{user_id}")
def get_user_profile(
    user_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    user_service = UserService(db) # [추가]
    
    user = user_service.get_user_by_id(user_id)
    if user:
        return user.__dict__
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/{user_id}")
def update_user_profile(
    user_id: int, 
    user_data: UserUpdateDto,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    user_service = UserService(db) # [추가]
    
    result = user_service.update_user(user_id, user_data.model_dump())
    if result:
        return {"message": "User updated successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{user_id}")
def delete_user_account(
    user_id: int,
    db: oracledb.Connection = Depends(get_db) # [추가]
):
    user_service = UserService(db) # [추가]
    
    result = user_service.delete_user(user_id)
    if result:
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")