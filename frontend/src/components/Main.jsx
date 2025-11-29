import React, { useState } from 'react';
import Map from './Map';
import LoginModal from './LoginModal';

function Main() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [content, setContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPanel, setShowPanel] = useState(true);

  const handleLogin = (user) => {
    setUser(user);
    setShowLoginModal(false);
  };

  const handleCloseModal = () => {
    // 로그인 완료 전까지 모달 닫기 비활성화
    return;
  };

  const handleCreateStory = (storyData) => {
    // 스토리 생성 로직은 Map 컴포넌트에서 처리
  };

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={null}
        onLogin={handleLogin}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: '#fafafa',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          filter: showLoginModal ? 'blur(5px)' : 'none',
          pointerEvents: showLoginModal ? 'none' : 'auto',
          userSelect: showLoginModal ? 'none' : 'auto',
          overflow: showLoginModal ? 'hidden' : 'auto'
        }}
        onMouseDown={(e) => showLoginModal && e.preventDefault()}
        onTouchStart={(e) => showLoginModal && e.preventDefault()}
        onKeyDown={(e) => showLoginModal && e.preventDefault()}
      >
        {/* 지도 - 전체 화면 */}
        <Map user={user} />

        {/* 사이드바 토글 버튼 */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1001,
              background: 'white',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ☰
          </button>
        )}

        {/* 왼쪽 사이드바 - 오버레이 스타일 */}
        {showSidebar && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '350px',
            height: '100%',
            backgroundColor: 'white',
            borderRight: '1px solid #dbdbdb',
            padding: '24px 16px',
            boxSizing: 'border-box',
            overflowY: 'hidden',
            zIndex: 1000,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                borderRadius: '8px',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>🗺️</div>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#262626'
              }}>StoryMap</h1>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e1e8ed',
              fontSize: '14px',
              color: '#65676b',
              lineHeight: '1.4'
            }}>
              💡 마커를 클릭하면 스토리 카드를 볼 수 있어요!
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e1e8ed'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#262626'
              }}>🎆 인기 지역</h3>
              <div style={{ fontSize: '14px', color: '#65676b' }}>
                강남역, 명동, 홍대, 이태원
              </div>
            </div>

            {/* 사이드바 닫기 버튼 */}
            <button
              onClick={() => setShowSidebar(false)}
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
          </div>
        )}

        {/* 패널 토글 버튼 */}
        {!showPanel && (
          <button
            onClick={() => setShowPanel(true)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1001,
              background: 'white',
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            📝
          </button>
        )}

        {/* 오른쪽 스토리 생성 패널 - 오버레이 스타일 */}
        {showPanel && (
          <>
            <style>
              {`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <div className="no-scrollbar" style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '380px',
              height: '100%',
              backgroundColor: 'white',
              borderLeft: '1px solid #dbdbdb',
              padding: '16px',
              boxSizing: 'border-box',
              overflowY: 'scroll',
              zIndex: 1000,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>

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
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#262626'
              }}>위도</label>
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
                  transition: 'border-color 0.2s'
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
                  transition: 'border-color 0.2s'
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
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
              />
            </div>

            <button
              onClick={() => {
                if (!lat || !lng || !content) {
                  alert('위도, 경도, 내용을 모두 입력해주세요.');
                  return;
                }
                if (!user) {
                  alert('로그인이 필요합니다.');
                  setShowLoginModal(true);
                  return;
                }

                // Map 컴포넌트에 스토리 생성 요청
                window.createStoryFromMain?.({ lat, lng, content });
                setLat('');
                setLng('');
                setContent('');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(240, 148, 51, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📍 스토리 생성하기
            </button>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e1e8ed',
              fontSize: '12px',
              color: '#65676b',
              lineHeight: '1.4'
            }}>
              💡 <strong>사용법:</strong><br />
              1. 위도/경도 입력 (예: 37.4979, 127.0276)<br />
              2. 스토리 내용 작성<br />
              3. 생성 버튼 클릭<br />
              4. 지도에서 마커 클릭하여 확인
            </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Main;