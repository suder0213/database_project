import React, { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../utils/auth';
import api from '../services/api';

function UserProfile({ onClose }) {
  const user = getCurrentUser();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    loadUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const loadUserInfo = async () => {
    if (user?.user_id) {
      try {
        const res = await api.get(`/users/${user.user_id}`);
        setUserInfo(res.data);
        setEditForm({ name: res.data.name, email: res.data.email, password: '' });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setLoading(false);
      }
    }
  };

  // [수정] 로그아웃 시 저장소 비우기
  const handleLogout = () => {
    // 1. 브라우저 저장소 청소
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    // 2. 기존 로그아웃 및 새로고침
    logout();
    window.location.reload();
  };

  const handleUpdate = async () => {
    try {
      const updateData = { name: editForm.name, email: editForm.email };
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password;
      }
      await api.put(`/users/${user.user_id}`, updateData);
      setIsEditing(false);
      loadUserInfo();
      alert('정보가 수정되었습니다.');
    } catch (error) {
      console.error('Update failed:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 회원탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      try {
        await api.delete(`/users/${user.user_id}`);
        alert('회원탈퇴가 완료되었습니다.');
        
        // 탈퇴 시에도 저장소 비우기 적용
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        logout();
        window.location.reload();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('탈퇴에 실패했습니다.');
      }
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '400px',
        maxWidth: '90vw',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>내 프로필</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : userInfo ? (
            <>
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  margin: '0 auto 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {userInfo.name?.charAt(0) || 'U'}
                </div>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{userInfo.name}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>@{userInfo.id}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                {isEditing ? (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>이름</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>이메일</label>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>비밀번호 (비워두면 변경안함)</label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                        placeholder="새 비밀번호"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>이메일</div>
                      <div style={{ fontSize: '14px', color: '#333' }}>{userInfo.email}</div>
                    </div>
                  
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>가입일</div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {new Date(userInfo.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>User ID</div>
                      <div style={{ fontSize: '14px', color: '#333' }}>{userInfo.user_id}</div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              정보를 불러올 수 없습니다.
            </div>
          )}
          
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✓ 저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: userInfo.name, email: userInfo.email, password: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#5a6268'}
                  onMouseOut={(e) => e.target.style.background = '#6c757d'}
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                ✏️ 정보 수정
              </button>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(45deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
              marginBottom: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }}
          >
            로그아웃
          </button>
          
          <button
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(45deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
            }}
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;