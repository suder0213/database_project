import React, { useState } from 'react';
import { storyAPI } from '../services/api';
import { getUserId } from '../utils/auth';

function RightPanel({
  showPanel,
  setShowPanel,
  panelOpacity,
  setPanelOpacity,
  lat,
  setLat,
  lng,
  setLng,
  content,
  setContent,
  getCurrentLocation,
  user,
  setShowLoginModal
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleCreateStory = async () => {
    if (!lat || !lng || !content) {
      alert('위도, 경도, 내용을 모두 입력해주세요.');
      return;
    }
    if (!user) {
      alert('로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    setIsCreating(true);
    try {
      const userId = getUserId();
      
      // 테스트 계정인 경우 가짜 성공
      if (userId === '999') {
        alert('스토리가 작성되었습니다! (테스트 모드)');
        setLat('');
        setLng('');
        setContent('');
        return;
      }

      const response = await fetch('/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          content,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          image_url: imageUrl || null
        })
      });
      
      const data = await response.json();

      if (data.success) {
        setLat('');
        setLng('');
        setContent('');
        setImageUrl('');
      }
    } catch (error) {
      console.error('Story creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <style>
        {`
          .panel-no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="panel-no-scrollbar" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '400px',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '3px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'hidden',
        zIndex: 1000,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1), -2px 0 20px rgba(240, 148, 51, 0.2), -5px 0 40px rgba(240, 148, 51, 0.1), -10px 0 80px rgba(188, 24, 136, 0.05)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: showPanel ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: showPanel ? panelOpacity : 0
      }}>

        {/* 투명도 조절 슬라이더 */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(240, 148, 51, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '16px',
                height: '16px',
                background: 'linear-gradient(45deg, #f09433, #bc1888)',
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              투명도
            </label>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#bc1888',
              background: 'linear-gradient(45deg, #f09433, #bc1888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{Math.round(panelOpacity * 100)}%</span>
          </div>
          <div style={{
            position: 'relative',
            height: '6px',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${(panelOpacity - 0.3) / 0.7 * 100}%`,
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={panelOpacity}
              onChange={(e) => setPanelOpacity(parseFloat(e.target.value))}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* 패널 닫기 버튼 */}
        <button
          onClick={() => setShowPanel(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            borderRadius: '50%',
            marginRight: '12px'
          }}></div>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#262626'
          }}>새 스토리 만들기</h3>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#262626'
            }}>위도</label>
            <button
              onClick={getCurrentLocation}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              📍 현재위치
            </button>
          </div>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="37.4979"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fafafa',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0095f6'}
            onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#262626'
          }}>경도</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="127.0276"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fafafa',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0095f6'}
            onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#262626'
          }}>스토리 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="여기에서 어떤 일이 있었나요? 사진과 함께 공유해보세요! 📸"
            style={{
              width: '100%',
              height: '80px',
              padding: '12px 16px',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fafafa',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0095f6'}
            onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#262626'
          }}>이미지 업로드 (선택)</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const res = await fetch('/upload/image', {
                    method: 'POST',
                    body: formData
                  });
                  const data = await res.json();
                  if (data.success) {
                    setImageUrl(data.url);
                  }
                } catch (err) {
                  console.error('Upload error:', err);
                }
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fafafa',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          />
          {imageUrl && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              업로드 완료: {imageUrl}
            </div>
          )}
        </div>

        <button
          onClick={handleCreateStory}
          disabled={isCreating}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isCreating ? '#ccc' : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            if (!isCreating) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(240, 148, 51, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isCreating) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {isCreating ? '작성 중...' : '📍 스토리 생성하기'}
        </button>
      </div>
    </>
  );
}

export default RightPanel;