# 엔티티별 API 정리

## 👤 USER (사용자)

### 로그인
```
POST /users/login
Request: { "id": "user1", "password": "1234" }
Response: { "message": "Login successful", "user_id": 123 }
```

### 회원가입
```
POST /users/register
Request: {
  "id": "newuser",
  "password": "1234",
  "name": "신규사용자",
  "email": "user@test.com"
}
Response: { "success": true, "user_id": 789 }
```

### 사용자 조회
```
GET /users/{user_id}
Response: {
  "user_id": 123,
  "id": "user1",
  "name": "사용자명",
  "email": "user@test.com",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 사용자 정보 수정
```
PUT /users/{user_id}
Request: {
  "name": "새로운이름",
  "email": "newemail@test.com"
}
Response: { "success": true }
```

### 사용자 삭제
```
DELETE /users/{user_id}
Response: { "success": true }
```

## 📖 STORY (스토리)

### 맵에서 스토리 보기
```
GET /stories/location/search?lat=37.5665&lng=126.9780&radius=1
Response: {
  "stories": [
    {
      "story_id": 1,
      "content": "맛있는 카페!",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "image_url": "image1.jpg",
      "likes": 15,
      "user_name": "김철수",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 스토리 작성
```
POST /stories
Request: {
  "user_id": 123,
  "content": "좋은 장소 발견!",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "image_url": "uploaded_image.jpg"
}
Response: { "success": true, "story_id": 456 }
```

### 내가 쓴 스토리 보기
```
GET /stories/user/123
Response: { "stories": [...] }
```

## ❤️ LIKE (좋아요)

### 좋아요 토글
```
POST /likes/toggle
Request: { 
  "user_id": 123,
  "story_id": 456 
}
Response: { "success": true, "liked": true, "total_likes": 16 }
```

### 좋아요 상태 확인
```
GET /likes/check/{user_id}/{story_id}
Example: GET /likes/check/123/456
Response: { 
  "success": true, 
  "liked": true 
}
```

### 스토리별 좋아요 목록
```
GET /likes/story/{story_id}
Response: {
  "likes": [
    {
      "user_id": 123,
      "user_name": "김철수",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 사용자별 좋아요 목록
```
GET /likes/user/{user_id}
Response: { 
  "liked_stories": [
    {
      "story_id": 456,
      "content": "좋은 장소!",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 스토리 좋아요 수
```
GET /likes/story/{story_id}/count
Response: { 
  "story_id": 456, 
  "total_likes": 16 
}
```

## 💬 COMMENT (댓글)

### 댓글 작성
```
POST /comments
Request: {
  "user_id": 123,
  "review_id": 456,
  "content": "좋은 리뷰네요!"
}
Response: { "success": true, "comment_id": 789 }
```

### 댓글 조회
```
GET /comments/{comment_id}
Response: {
  "comment_id": 789,
  "content": "좋은 리뷰네요!",
  "user_name": "댓글러",
  "review_id": 456,
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 리뷰별 댓글 목록
```
GET /comments/review/{review_id}
Response: {
  "comments": [
    {
      "comment_id": 1,
      "content": "동감합니다!",
      "user_name": "댓글러",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 사용자별 댓글 목록
```
GET /comments/user/{user_id}
Response: {
  "comments": [
    {
      "comment_id": 1,
      "content": "좋은 리뷰네요!",
      "review_title": "맛있는 카페",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 댓글 수정
```
PUT /comments/{comment_id}
Request: {
  "content": "수정된 댓글 내용"
}
Response: { "success": true }
```

### 댓글 삭제
```
DELETE /comments/{comment_id}
Response: { "success": true }
```

## 📍 PLACE (장소)

### 장소 검색
```
GET /places/search/location?lat=37.5665&lng=126.9780&radius=1
Response: {
  "places": [
    {
      "place_id": 1,
      "name": "스타벅스 강남점",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "average_rating": 4.5
    }
  ]
}
```

### 장소 생성
```
POST /places
Request: {
  "name": "스타벅스 강남점",
  "latitude": 37.5665,
  "longitude": 126.9780
}
Response: { "success": true, "place_id": 123 }
```

### 장소 조회
```
GET /places/{place_id}
Response: {
  "place_id": 1,
  "name": "스타벅스 강남점",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 장소 정보 수정
```
PUT /places/{place_id}
Request: {
  "name": "스타벅스 강남역점",
  "latitude": 37.5665,
  "longitude": 126.9780
}
Response: { "success": true }
```

### 장소 삭제
```
DELETE /places/{place_id}
Response: { "success": true }
```

## ⭐ REVIEW (리뷰)

### 리뷰 작성
```
POST /reviews
Request: {
  "user_id": 123,
  "place_id": 1,
  "title": "맛있는 카페",
  "content": "분위기 좋아요",
  "rating": 4.5
}
Response: { "success": true, "review_id": 456 }
```

### 리뷰 조회
```
GET /reviews/{review_id}
Response: {
  "review_id": 456,
  "title": "맛있는 카페",
  "content": "분위기 좋아요",
  "rating": 4.5,
  "user_name": "리뷰어",
  "place_name": "스타벅스 강남점",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 장소별 리뷰 목록
```
GET /reviews/place/{place_id}
Response: {
  "reviews": [
    {
      "review_id": 1,
      "title": "좋은 카페",
      "content": "커피가 맛있어요",
      "rating": 4.5,
      "user_name": "리뷰어",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 사용자별 리뷰 목록
```
GET /reviews/user/{user_id}
Response: {
  "reviews": [
    {
      "review_id": 1,
      "title": "좋은 카페",
      "content": "커피가 맛있어요",
      "rating": 4.5,
      "place_name": "스타벅스 강남점",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 리뷰 수정
```
PUT /reviews/{review_id}
Request: {
  "title": "수정된 제목",
  "content": "수정된 내용",
  "rating": 5.0
}
Response: { "success": true }
```

### 리뷰 삭제
```
DELETE /reviews/{review_id}
Response: { "success": true }
```

## 🏷️ TAG (태그)

### 태그 생성
```
POST /tags
Request: {
  "name": "새태그"
}
Response: { "success": true, "tag_id": 123 }
```

### 모든 태그 목록
```
GET /tags
Response: {
  "tags": [
    { "tag_id": 1, "name": "카페" },
    { "tag_id": 2, "name": "맛집" }
  ]
}
```

### 태그 조회
```
GET /tags/{tag_id}
Response: {
  "tag_id": 1,
  "name": "카페",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 스토리에 태그 추가
```
POST /tags/story/{story_id}
Request: { 
  "tag_name": "카페" 
}
Response: { "success": true }
```

**동작 방식:**
- 태그가 이미 존재하면: 해당 tag_id를 스토리에 연결
- 태그가 없으면: 새로 생성 후 스토리에 연결
- 중복 추가 방지: 같은 태그는 한 번만 추가됨

### 스토리에서 태그 제거
```
DELETE /tags/story/{story_id}/tag/{tag_id}
Response: { "success": true }
```

### 스토리별 태그 목록
```
GET /tags/story/{story_id}
Response: {
  "tags": [
    { "tag_id": 1, "name": "카페" },
    { "tag_id": 2, "name": "맛집" }
  ]
}
```

### 태그별 스토리 목록
```
GET /tags/{tag_id}/stories
Response: {
  "stories": [
    {
      "story_id": 456,
      "content": "좋은 카페 발견!",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "user_name": "김철수",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## 프론트엔드 사용법
```javascript
// 사용자
const login = async (id, password) => {
  return fetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password })
  });
};

// 스토리
const createStory = async (storyData) => {
  const userId = localStorage.getItem('user_id');
  return fetch('/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...storyData, user_id: userId })
  });
};

// 좋아요
const toggleLike = async (storyId) => {
  const userId = localStorage.getItem('user_id');
  return fetch('/likes/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, story_id: storyId })
  });
};

// 좋아요 상태 확인
const checkLikeStatus = async (storyId) => {
  const userId = localStorage.getItem('user_id');
  return fetch(`/likes/check/${userId}/${storyId}`);
};

// 스토리 좋아요 수 조회
const getStoryLikeCount = async (storyId) => {
  return fetch(`/likes/story/${storyId}/count`);
};

// 댓글
const createComment = async (reviewId, content) => {
  const userId = localStorage.getItem('user_id');
  return fetch('/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, review_id: reviewId, content })
  });
};

// 태그
const addTagToStory = async (storyId, tagName) => {
  return fetch(`/tags/story/${storyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_name: tagName })
  });
};
```