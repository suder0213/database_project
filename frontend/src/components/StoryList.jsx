import React, { useState, useEffect } from 'react';
import { storyAPI } from '../services/api';

function StoryList({ latitude, longitude, radius = 1 }) {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, [latitude, longitude, radius]);

  const loadStories = async () => {
    try {
      const response = await storyAPI.getNearbyStories(latitude, longitude, radius);
      setStories(response.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>스토리 로딩 중...</div>;
  }

  if (stories.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>주변에 스토리가 없습니다.</div>;
  }

  return (
    <div style={{ padding: '10px' }}>
      {stories.map((story) => (
        <div
          key={story.story_id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: 'white'
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#333' }}>{story.user_name}</strong>
            <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
              {new Date(story.created_at).toLocaleDateString()}
            </span>
          </div>
          <p style={{ margin: '10px 0', fontSize: '14px' }}>{story.content}</p>
          {story.image_url && (
            <img
              src={story.image_url}
              alt="Story"
              style={{
                maxWidth: '100%',
                borderRadius: '6px',
                marginTop: '10px'
              }}
            />
          )}
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            ❤️ {story.likes || 0}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StoryList;
