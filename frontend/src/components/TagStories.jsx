import React, { useState, useEffect } from 'react';
import { tagAPI, storyAPI } from '../services/api';

function TagStories({ tagId, tagName, onClose, onMoveToLocation }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTagStories();
  }, [tagId]);

  const loadTagStories = async () => {
    try {
      const response = await tagAPI.getTagStories(tagId);
      const storyIds = response.story_ids || [];
      
      if (storyIds.length === 0) {
        setStories([]);
        return;
      }

      const storyPromises = storyIds.map(id => storyAPI.getStoryById(id));
      const storiesData = await Promise.all(storyPromises);
      setStories(storiesData);
    } catch (error) {
      console.error('태그 스토리 로드 실패:', error);
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
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)',
        animation: 'modalFadeIn 0.2s ease-out'
      }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 240, 255, 0.95) 100%)',
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            }}>#</div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
                #{tagName}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                {stories.length}개의 스토리
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
          ) : stories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '16px', margin: 0 }}>이 태그를 가진 스토리가 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stories.map((story, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 240, 255, 0.9) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  try {
                    const response = await storyAPI.getStoryById(story.story_id);
                    if (onMoveToLocation && response.latitude && response.longitude) {
                      onMoveToLocation(response.latitude, response.longitude);
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    onClose();
                    window.openStoryModal?.(response);
                  } catch (error) {
                    console.error('스토리 불러오기 실패:', error);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>📖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '8px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}>
                        {story.content || '내용 없음'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>👤 {story.user_name || '익명'}</span>
                        <span>•</span>
                        <span>❤️ {story.likes || 0}</span>
                        <span>•</span>
                        <span>📅 {new Date(story.created_at).toLocaleDateString('ko-KR')}</span>
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

export default TagStories;
