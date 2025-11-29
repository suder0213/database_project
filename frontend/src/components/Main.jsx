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
  const [buttonPosition, setButtonPosition] = useState({ top: '50%', right: '20px' });
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpacity, setSidebarOpacity] = useState(0.95);
  const [panelOpacity, setPanelOpacity] = useState(0.95);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 지도 클릭으로 좌표 설정 받는 함수
  window.setMapClickLocation = (latitude, longitude) => {
    setLat(latitude.toString());
    setLng(longitude.toString());
  };

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Map 컴포넌트에 위치 이동 요청
        window.moveMapToLocation?.(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
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
          overflow: 'hidden'
        }}
        onMouseDown={(e) => showLoginModal && e.preventDefault()}
        onTouchStart={(e) => showLoginModal && e.preventDefault()}
        onKeyDown={(e) => showLoginModal && e.preventDefault()}
      >
        {/* 지도 - 전체 화면 */}
        <Map user={user} />

        {/* 현재 위치로 이동 버튼 */}
        <div 
          style={{ 
            position: 'absolute', 
            top: buttonPosition.top, 
            right: buttonPosition.right, 
            transform: 'translateY(-50%)', 
            zIndex: 1001,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            const startX = e.clientX;
            const startY = e.clientY;
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetX = startX - rect.left;
            const offsetY = startY - rect.top;
            
            const handleMouseMove = (e) => {
              const newRight = window.innerWidth - e.clientX - offsetX;
              const newTop = e.clientY - offsetY;
              setButtonPosition({ 
                top: Math.max(0, Math.min(window.innerHeight - 50, newTop)) + 'px',
                right: Math.max(0, Math.min(window.innerWidth - 50, newRight)) + 'px'
              });
            };
            
            const handleMouseUp = () => {
              setIsDragging(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <button

            className="location-btn"
            style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(240, 148, 51, 0.3)',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isDragging) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 20px rgba(240, 148, 51, 0.5)';
                e.target.nextSibling.style.opacity = '1';
                e.target.nextSibling.style.transform = 'translateY(-50%) scale(1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragging) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(240, 148, 51, 0.3)';
                e.target.nextSibling.style.opacity = '0';
                e.target.nextSibling.style.transform = 'translateY(-50%) scale(0.8)';
              }
            }}
            onClick={(e) => {
              if (!isDragging) {
                moveToCurrentLocation();
              }
            }}
          >
            🧭
          </button>
          <div style={{
            position: 'absolute',
            right: '60px',
            top: '50%',
            transform: 'translateY(-50%) scale(0.8)',
            background: 'linear-gradient(135deg, rgba(240, 148, 51, 0.95), rgba(188, 24, 136, 0.95))',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            pointerEvents: 'none',
            boxShadow: '0 8px 25px rgba(240, 148, 51, 0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            현재 위치로 이동
            <div style={{
              position: 'absolute',
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0',
              height: '0',
              borderLeft: '8px solid rgba(240, 148, 51, 0.95)',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              filter: 'drop-shadow(2px 0 4px rgba(240, 148, 51, 0.3))'
            }}></div>
          </div>
        </div>

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
        <div style={{
          position: 'absolute',
          top: 0,
          left: showSidebar ? 0 : '-350px',
          width: '350px',
          height: '100%',
          backgroundColor: 'white',
          borderRight: '3px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          padding: '24px 16px',
          boxSizing: 'border-box',
          overflowY: 'hidden',
          zIndex: 1000,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1), 2px 0 20px rgba(240, 148, 51, 0.2), 5px 0 40px rgba(240, 148, 51, 0.1), 10px 0 80px rgba(188, 24, 136, 0.05)',
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: showSidebar ? 'translateX(0) scale(1)' : 'translateX(-100%) scale(0.95)',
          opacity: showSidebar ? sidebarOpacity : 0
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
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#f8f9fa, #f8f9fa), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              fontSize: '14px',
              color: '#65676b',
              lineHeight: '1.4',
              boxShadow: '0 4px 15px rgba(240, 148, 51, 0.1)'
            }}>
              💡 마커를 클릭하면 스토리 카드를 볼 수 있어요!
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 15px rgba(240, 148, 51, 0.1)'
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

            {/* 투명도 조절 슬라이더 */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '16px',
              right: '16px',
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
                }}>{Math.round(sidebarOpacity * 100)}%</span>
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
                  width: `${(sidebarOpacity - 0.3) / 0.7 * 100}%`,
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.05"
                  value={sidebarOpacity}
                  onChange={(e) => setSidebarOpacity(parseFloat(e.target.value))}
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
                .panel-slide-in {
                  animation: slideInFromRight 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes slideInFromRight {
                  0% {
                    transform: translateX(100%) scale(0.8) rotateY(15deg);
                    opacity: 0;
                    filter: blur(10px);
                  }
                  50% {
                    transform: translateX(-10px) scale(1.02) rotateY(-2deg);
                    opacity: 0.8;
                    filter: blur(2px);
                  }
                  100% {
                    transform: translateX(0) scale(1) rotateY(0deg);
                    opacity: 1;
                    filter: blur(0px);
                  }
                }
              `}
            </style>
            <div className="no-scrollbar panel-slide-in" style={{
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
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1), -2px 0 20px rgba(240, 148, 51, 0.2), -5px 0 40px rgba(240, 148, 51, 0.1), -10px 0 80px rgba(188, 24, 136, 0.05)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              opacity: panelOpacity
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
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
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
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
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


            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Main;