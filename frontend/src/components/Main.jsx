import React, { useState } from 'react';
import Map from './Map';
import LoginModal from './LoginModal';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import PlaceModal from './PlaceModal';
import StoryModal from './StoryModal';

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
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);

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

  // 장소 모달 열기
  window.openPlaceModal = (placeId, placeName) => {
    setSelectedPlaceId(placeId);
    setSelectedPlaceName(placeName);
  };

  // 스토리 모달 열기
  window.openStoryModal = (story) => {
    setSelectedStory(story);
  };

  // 장소 모달 닫을 때 장소 마커 새로고침
  const handlePlaceModalClose = () => {
    setSelectedPlaceId(null);
    window.refreshPlaceMarkers?.();
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
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}>
          <Map user={user} />
        </div>

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

        <LeftSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sidebarOpacity={sidebarOpacity}
          setSidebarOpacity={setSidebarOpacity}
        />

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

        <RightPanel
          showPanel={showPanel}
          setShowPanel={setShowPanel}
          panelOpacity={panelOpacity}
          setPanelOpacity={setPanelOpacity}
          lat={lat}
          setLat={setLat}
          lng={lng}
          setLng={setLng}
          content={content}
          setContent={setContent}
          getCurrentLocation={getCurrentLocation}
          user={user}
          setShowLoginModal={setShowLoginModal}
        />
      </div>

      {/* 장소 모달 */}
      {selectedPlaceId && (
        <PlaceModal
          placeId={selectedPlaceId}
          placeName={selectedPlaceName}
          onClose={handlePlaceModalClose}
        />
      )}

      {/* 스토리 모달 */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}

export default Main;