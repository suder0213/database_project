from fastapi import APIRouter, HTTPException
from Service.user_service import UserService
from Enitity.User_t import UserCreateDto, UserLoginDto, UserUpdateDto

router = APIRouter(prefix="/users", tags=["users"])
user_service = UserService()

@router.post("/register")
def register_user(user_data: UserCreateDto):
    user_id = user_service.create_user_and_return_id(user_data.model_dump())
    if user_id:
        return {"success": True, "user_id": user_id}
    raise HTTPException(status_code=400, detail="Failed to register user")

@router.post("/login")
def login_user(login_data: UserLoginDto):
    user = user_service.authenticate_user(login_data.id, login_data.password)
    if user:
        return {"message": "Login successful", "user_id": user.user_id}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/{user_id}")
def get_user_profile(user_id: int):
    user = user_service.get_user_by_id(user_id)
    if user:
        return user.__dict__
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/{user_id}")
def update_user_profile(user_id: int, user_data: UserUpdateDto):
    result = user_service.update_user(user_id, user_data.model_dump())
    if result:
        return {"message": "User updated successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{user_id}")
def delete_user_account(user_id: int):
    result = user_service.delete_user(user_id)
    if result:
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")