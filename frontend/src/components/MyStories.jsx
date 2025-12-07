import React, { useState, useEffect } from 'react';
import { storyAPI } from '../services/api';
import { getUserId } from '../utils/auth';

function MyStories({ onClose }) {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyStories();
  }, []);

  const loadMyStories = async () => {
    try {
      const userId = getUserId();
      if (userId) {
        const response = await fetch(`/stories/user/${userId}`);
        const data = await response.json();
        // API 명세: { "stories": [...] }
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
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>내가 쓴 스토리</h2>
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

        {error && (
          <div style={{
            color: 'red',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            스토리를 불러오는 중...
          </div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            작성한 스토리가 없습니다.
          </div>
        ) : (
          <div>
            {stories.map((story) => (
              <div
                key={story.story_id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={(e) => {
                  if (!e.target.closest('button') && story.latitude && story.longitude) {
                    window.moveMapToLocation?.(story.latitude, story.longitude);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                      {story.content}
                    </p>
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt="Story"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '150px',
                          borderRadius: '4px',
                          marginBottom: '10px'
                        }}
                      />
                    )}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>좋아요: {story.likes || 0}개</div>
                      <div>작성일: {new Date(story.created_at).toLocaleDateString()}</div>
                      <div>위치: {story.latitude?.toFixed(4)}, {story.longitude?.toFixed(4)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStory(story.story_id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyStories;