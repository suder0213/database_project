import React, { useState, useEffect } from 'react';
import { likeAPI, tagAPI } from '../services/api';

function StoryModal({ story, onClose }) {
  const [currentLikes, setCurrentLikes] = useState(story.likes || 0);
  const imageUrl = story.image_url && story.image_url !== 'null' && story.image_url !== 'undefined' ? story.image_url : '';
  const userName = story.user_name || '익명';
  const content = story.content || '';
  const createdAt = story.created_at ? new Date(story.created_at).toLocaleDateString() : '';
  const [showLikesList, setShowLikesList] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [heartAnimType, setHeartAnimType] = useState('like');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    loadTags();
    loadAllTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagAPI.getStoryTags(story.story_id);
      setTags(response.tags || []);
    } catch (error) {
      console.error('태그 불러오기 실패:', error);
    }
  };

  const loadAllTags = async () => {
    try {
      const response = await tagAPI.getAllTags();
      setAllTags(response.tags || []);
    } catch (error) {
      console.error('전체 태그 불러오기 실패:', error);
    }
  };

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

  const handleAddTag = async (tagName) => {
    try {
      await tagAPI.addTagToStory(story.story_id, tagName);
      loadTags();
      setTagInput('');
    } catch (error) {
      console.error('태그 추가 실패:', error);
      const errorMsg = error.response?.data?.detail || '태그 추가에 실패했습니다.';
      alert(errorMsg);
    }
  };

  const filteredTags = allTags.filter(t => 
    !tags.some(st => st.tag_id === t.tag_id) &&
    t.name.toLowerCase().includes(tagInput.toLowerCase())
  );

  const handleRemoveTag = async (tagId) => {
    try {
      await tagAPI.removeTagFromStory(story.story_id, tagId);
      loadTags();
    } catch (error) {
      console.error('태그 삭제 실패:', error);
      alert('태그 삭제에 실패했습니다.');
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
        @keyframes heartBurst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes heartBreak {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          25% { transform: translate(-50%, -50%) scale(1.1) rotate(-10deg); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.2) rotate(10deg); opacity: 0.8; }
          75% { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 0; }
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
        
        <div 
          onDoubleClick={async (e) => {
            e.stopPropagation();
            if (!userId) {
              alert('로그인이 필요합니다.');
              return;
            }
            try {
              const response = await likeAPI.toggleLike(story.story_id);
              if (response.success) {
                setCurrentLikes(response.total_likes);
                setHeartAnimType(response.liked ? 'like' : 'unlike');
                setShowHeartAnim(true);
                setTimeout(() => setShowHeartAnim(false), 600);
              }
            } catch (error) {
              console.error('좋아요 실패:', error);
              alert('좋아요 처리에 실패했습니다.');
            }
          }}
          style={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          userSelect: 'none'
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
          
          {/* 하트 애니메이션 */}
          {showHeartAnim && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '80px',
              zIndex: 10,
              pointerEvents: 'none',
              animation: heartAnimType === 'like' ? 'heartBurst 0.6s ease-out' : 'heartBreak 0.6s ease-out'
            }}>
              {heartAnimType === 'like' ? '❤️' : '💔'}
            </div>
          )}
          
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
            padding: '8px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxHeight: '250px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.4',
              marginBottom: '4px',
              color: '#333',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>{content}</div>
            
            {/* 태그 */}
            {tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '3px',
                marginBottom: '2px'
              }}>
                {tags.map((tag) => (
                  <span key={tag.tag_id} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '3px 8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    #{tag.name}
                    {userId && (
                      <button
                        onClick={() => handleRemoveTag(tag.tag_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '10px',
                          lineHeight: 1
                        }}
                      >✕</button>
                    )}
                  </span>
                ))}
              </div>
            )}
            
            {/* 태그 추가 */}
            {userId && (
              <div style={{ position: 'relative', marginTop: '2px', marginBottom: '4px', display: 'flex' }}>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && tagInput.trim() && handleAddTag(tagInput.trim())}
                  placeholder="태그 입력..."
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #667eea',
                    borderRadius: '8px',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                
                {tagInput && filteredTags.length > 0 && (
                  <div style={{
                    position: 'fixed',
                    bottom: 'auto',
                    top: 'auto',
                    left: '22px',
                    right: '22px',
                    transform: 'translateY(-100%)',
                    marginBottom: '4px',
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
                    zIndex: 10001
                  }}>
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.tag_id}
                        onClick={() => handleAddTag(tag.name)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5ff'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        #{tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
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
                ❤️ {currentLikes}
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
