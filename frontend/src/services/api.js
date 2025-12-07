import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: user_id 자동 추가
api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('user_id');
    if (userId && config.data && typeof config.data === 'object') {
      // POST, PUT 요청에 user_id 자동 추가 (이미 있으면 덮어쓰지 않음)
      if (!config.data.user_id) {
        config.data.user_id = parseInt(userId);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃
      localStorage.removeItem('user_id');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  login: async (id, password) => {
    const response = await api.post('/users/login', { id, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  }
};

// 스토리 관련 API
export const storyAPI = {
  getNearbyStories: async (lat, lng, radius = 1) => {
    const response = await api.get(`/stories/location/search?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },
  
  getNearbyStoriesByBounds: async (swLat, swLng, neLat, neLng) => {
    const response = await api.get(`/stories/location/bounds?sw_lat=${swLat}&sw_lng=${swLng}&ne_lat=${neLat}&ne_lng=${neLng}`);
    return response.data;
  },
  
  createStory: async (storyData) => {
    const response = await api.post('/stories', storyData);
    return response.data;
  },
  
  getStoryById: async (storyId) => {
    const response = await api.get(`/stories/${storyId}`);
    return response.data;
  },
  
  getUserStories: async (userId) => {
    const response = await api.get(`/stories/user/${userId}`);
    return response.data;
  },
  
  updateStory: async (storyId, content, imageUrl = null) => {
    const data = { content };
    if (imageUrl) data.image_url = imageUrl;
    const response = await api.put(`/stories/${storyId}`, data);
    return response.data;
  },
  
  deleteStory: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  }
};

// 좋아요 관련 API
export const likeAPI = {
  toggleLike: async (storyId) => {
    const response = await api.post('/likes/toggle', { story_id: storyId });
    return response.data;
  },
  
  getUserLikes: async (userId) => {
    const response = await api.get(`/likes/user/${userId}`);
    return response.data;
  },
  
  getLikeCount: async (storyId) => {
    const response = await api.get(`/likes/story/${storyId}/count`);
    return response.data;
  },
  
  checkLikeStatus: async (userId, storyId) => {
    const response = await api.get(`/likes/check/${userId}/${storyId}`);
    return response.data;
  },
  
  getStoryLikes: async (storyId) => {
    const response = await api.get(`/likes/story/${storyId}`);
    return response.data;
  }
};

// 장소 관련 API
export const placeAPI = {
  searchNearbyPlaces: async (lat, lng, radius = 1) => {
    const response = await api.get(`/places/search/location?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },
  
  searchPlacesByBounds: async (swLat, swLng, neLat, neLng) => {
    const response = await api.get(`/places/search/bounds?sw_lat=${swLat}&sw_lng=${swLng}&ne_lat=${neLat}&ne_lng=${neLng}`);
    return response.data;
  },
  
  createPlace: async (placeData) => {
    const response = await api.post('/places', placeData);
    return response.data;
  },
  
  getPlaceById: async (placeId) => {
    const response = await api.get(`/places/${placeId}`);
    return response.data;
  }
};

// 리뷰 관련 API
export const reviewAPI = {
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  getReviewById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },
  
  getPlaceReviews: async (placeId) => {
    const response = await api.get(`/reviews/place/${placeId}`);
    return response.data;
  },
  
  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
  
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

// 댓글 관련 API
export const commentAPI = {
  createComment: async (reviewId, content) => {
    const response = await api.post('/comments', { review_id: reviewId, content });
    return response.data;
  },
  
  getCommentById: async (commentId) => {
    const response = await api.get(`/comments/${commentId}`);
    return response.data;
  },
  
  getReviewComments: async (reviewId) => {
    const response = await api.get(`/comments/review/${reviewId}`);
    return response.data;
  },
  
  getUserComments: async (userId) => {
    const response = await api.get(`/comments/user/${userId}`);
    return response.data;
  },
  
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },
  
  deleteComment: async (commentId) => {
    const userId = localStorage.getItem('user_id');
    const response = await api.delete(`/comments/${commentId}?user_id=${userId}`);
    return response.data;
  }
};

// 태그 관련 API
export const tagAPI = {
  getAllTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
  
  addTagToStory: async (storyId, tagName) => {
    const response = await api.post(`/tags/story/${storyId}`, { tag_name: tagName });
    return response.data;
  },
  
  removeTagFromStory: async (storyId, tagId) => {
    const response = await api.delete(`/tags/story/${storyId}/tag/${tagId}`);
    return response.data;
  },
  
  getStoryTags: async (storyId) => {
    const response = await api.get(`/tags/story/${storyId}`);
    return response.data;
  },
  
  getTagStories: async (tagId) => {
    const response = await api.get(`/tags/${tagId}/stories`);
    return response.data;
  }
};

export default api;