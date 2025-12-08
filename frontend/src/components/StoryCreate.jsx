import React, { useState } from 'react';
import { storyAPI } from '../services/api';
import { getUserId } from '../utils/auth';

function StoryCreate({ onClose, onSuccess, latitude, longitude }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = getUserId();
    
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    setIsLoading(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await fetch('/upload/image', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      }

      const response = await fetch('/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          content,
          latitude,
          longitude,
          image_url: imageUrl
        })
      });
      
      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Story creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
        borderRadius: '24px',
        padding: '30px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '700' }}>📍 스토리 작성</h2>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 장소에서의 경험을 공유해주세요..."
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                minHeight: '120px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b9d'}
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
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                boxSizing: 'border-box',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="미리보기" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '12px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255, 107, 157, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 107, 157, 0.2)' }}>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
              <div>📍 위치: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px',
                background: isLoading ? '#ccc' : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(240, 148, 51, 0.3)'
              }}
            >
              {isLoading ? '작성 중...' : '✔ 작성하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoryCreate;
