import React, { useState, useEffect } from 'react';
import { likeAPI, storyAPI } from '../services/api';

function MyLikes({ onClose, onMoveToLocation }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      const response = await likeAPI.getUserLikes(userId);
      setLikes(response.liked_stories || []);
    } catch (error) {
      console.error('좋아요 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translate3d(0, 20px, 0) scale(0.96); opacity: 0; }
          to { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)',
        animation: 'modalFadeIn 0.2s ease-out'
      }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        animation: 'modalSlideUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform, opacity'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)',
          padding: '24px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              backdropFilter: 'blur(10px)'
            }}>❤️</div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
                좋아요한 스토리
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                {likes.length}개의 스토리
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'white',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.5)';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'rotate(0deg)';
          }}>✕</button>
        </div>

        {/* 콘텐츠 */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(80vh - 140px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
          transform: 'translateZ(0)',
          paddingBottom: '32px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              로딩 중...
            </div>
          ) : likes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💔</div>
              <p style={{ fontSize: '16px', margin: 0 }}>아직 좋아요한 스토리가 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {likes.map((like, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid rgba(255, 107, 157, 0.2)',
                  boxShadow: '0 4px 15px rgba(255, 107, 157, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  try {
                    const response = await storyAPI.getStoryById(like.story_id);
                    if (onMoveToLocation && response.latitude && response.longitude) {
                      onMoveToLocation(response.latitude, response.longitude);
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    window.openStoryModal?.(response);
                  } catch (error) {
                    console.error('스토리 불러오기 실패:', error);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 157, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 157, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.2)';
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)'
                    }}>❤️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '8px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}>
                        {like.content || like.story_content || '내용 없음'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>📅 {new Date(like.created_at).toLocaleDateString('ko-KR')}</span>
                        <span>•</span>
                        <span>Story #{like.story_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default MyLikes;
