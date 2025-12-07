// 로그인 상태 확인
export const checkAuthStatus = () => {
  const userId = localStorage.getItem('user_id');
  const user = localStorage.getItem('user');
  return !!(userId && user);
};

// 사용자 정보 가져오기
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 로그인 정보 저장
export const saveAuthData = (user) => {
  localStorage.setItem('user_id', user.user_id);
  localStorage.setItem('user', JSON.stringify(user));
};

// 사용자 ID 가져오기
export const getUserId = () => {
  return localStorage.getItem('user_id');
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user');
};