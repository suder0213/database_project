import React, { useState } from 'react';
import { likeAPI } from '../services/api';

function StoryModal({ story, onClose }) {
  const likes = story.likes || 0;
  const imageUrl = story.image_url && story.image_url !== 'null' && story.image_url !== 'undefined' ? story.image_url : '';
  const userName = story.user_name || '익명';
  const content = story.content || '';
  const createdAt = story.created_at ? new Date(story.created_at).toLocaleDateString() : '';
  const [showLikesList, setShowLikesList] = useState(false);
  const [likesList, setLikesList] = useState([]);

  const handleShowLikes = async () => {
    if (showLikesList) {
      setShowLikesList(false);
      return;
    }
    
    try {
      const response = await likeAPI.getStoryLikes(story.story_id);
      setLikesList(response.likes || []);
      setShowLikesList(true);
    } catch (error) {
      console.error('좋아요 목록 불러오기 실패:', error);
    }
  };

  return (
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
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px) scale(0.96); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        position: 'relative',
        width: '350px',
        height: '620px',
        background: 'white',
        borderRadius: '20px',
        border: '3px solid #667eea',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px'
        }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Story" style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }} />
          ) : '📸'}
          
          {/* 상단 사용자 정보 */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'white',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#667eea',
              fontSize: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>{userName.charAt(0).toUpperCase()}</div>
            <div style={{
              color: '#333',
              fontWeight: '600',
              fontSize: '15px'
            }}>{userName}</div>
          </div>
          
          {/* 하단 콘텐츠 */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '12px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.4',
              marginBottom: '12px',
              color: '#333',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>{content}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#666'
            }}>
              <button
                onClick={handleShowLikes}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                ❤️ {likes}
              </button>
              <span style={{ fontSize: '12px' }}>{createdAt}</span>
            </div>
            
            {showLikesList && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>
                  좋아요 누른 사람
                </div>
                {likesList.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#999' }}>아직 좋아요가 없습니다.</div>
                ) : (
                  likesList.map((like, index) => (
                    <div key={index} style={{
                      fontSize: '13px',
                      padding: '4px 0',
                      color: '#333'
                    }}>
                      {like.user_name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* 닫기 버튼 */}
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            color: 'white',
            transition: 'all 0.2s',
            zIndex: 3,
            backdropFilter: 'blur(10px)'
          }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default StoryModal;
