import React, { useState, useEffect } from 'react';
import { storyAPI } from '../services/api';
import { getUserId } from '../utils/auth';
import StoryModal from './StoryModal';

function MyStories({ onClose, onMoveToLocation }) {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStory, setEditingStory] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    loadMyStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyStories = async () => {
    try {
      const userId = getUserId();
      if (userId) {
        const response = await fetch(`/stories/user/${userId}`);
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
      setError('스토리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
      try {
        await fetch(`/stories/${storyId}`, { method: 'DELETE' });
        setStories(stories.filter(story => story.story_id !== storyId));
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleEditClick = (story, e) => {
    e.stopPropagation();
    setEditingStory(story);
    setEditContent(story.content);
    setEditImageUrl(story.image_url || '');
  };

  const handleSaveEdit = async () => {
    try {
      let finalImageUrl = editImageUrl;
      
      if (editImageFile) {
        const formData = new FormData();
        formData.append('file', editImageFile);
        const uploadResponse = await fetch('/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.url;
      }
      
      await storyAPI.updateStory(editingStory.story_id, editContent, finalImageUrl || null);
      setStories(stories.map(s => s.story_id === editingStory.story_id ? {...s, content: editContent, image_url: finalImageUrl} : s));
      setEditingStory(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setEditContent('');
    setEditImageUrl('');
    setEditImageFile(null);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryClick = async (story) => {
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
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 255, 245, 0.95) 100%)',
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
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
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
            }}>📖</div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
                내가 쓴 스토리
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
          {error && (
            <div style={{
              color: '#dc3545',
              marginBottom: '15px',
              padding: '12px',
              background: 'rgba(220, 53, 69, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(220, 53, 69, 0.2)'
            }}>
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              로딩 중...
            </div>
          ) : stories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
              <p style={{ fontSize: '16px', margin: 0 }}>아직 작성한 스토리가 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stories.map((story) => (
                <div key={story.story_id} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 255, 245, 0.9) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid rgba(40, 167, 69, 0.2)',
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.2)';
                }}
                onClick={() => handleStoryClick(story)}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
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
                        {story.content}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#999',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <span>❤️ 좋아요 {story.likes || 0}개</span>
                        <span>📅 {new Date(story.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => handleEditClick(story, e)}
                        style={{
                          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStory(story.story_id);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {/* 수정 모달 */}
      {editingStory && (
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
          zIndex: 10001,
          backdropFilter: 'blur(5px)',
          animation: 'modalFadeIn 0.2s ease-out'
        }} onClick={handleCancelEdit}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 245, 255, 0.95) 100%)',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            animation: 'modalSlideUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* 헤더 */}
            <div style={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              padding: '20px 24px',
              borderRadius: '22px 22px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>✏️</div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>
                  스토리 수정
                </h3>
              </div>
              <button onClick={handleCancelEdit} style={{
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                color: 'white',
                transition: 'all 0.2s'
              }}>✕</button>
            </div>

            {/* 콘텐츠 */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  스토리 내용
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="스토리 내용을 입력하세요..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  이미지 업로드 (선택)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
                {editImageUrl && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <img 
                      src={editImageUrl} 
                      alt="미리보기" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '12px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* 버튼 */}
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }}
                >
                  ✓ 저장
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    flex: 1,
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.background = '#6c757d'}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyStories;
