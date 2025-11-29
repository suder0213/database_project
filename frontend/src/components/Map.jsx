import React, { useEffect, useRef, useState } from 'react';

function Map({ user }) {
  const mapRef = useRef(null);
  const [renderedMap, setRenderedMap] = useState(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    const initMap = () => {
      if (mapInitialized.current) {
        console.log('맵 이미 초기화됨 - 중단');
        return;
      }

      const container = mapRef.current;
      if (!container) {
        console.log('맵 컨테이너가 준비되지 않음');
        return;
      }
      const options = {
        center: new window.kakao.maps.LatLng(37.4979, 127.0276), // 서울 강남역
        level: 3,
        draggable: true,
        scrollwheel: true,
        disableDoubleClick: false,
        disableDoubleClickZoom: false,
        tileAnimation: false,
        projectionId: 'EPSG:3857'
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('맵 생성 성공! - ID:', Date.now());
      mapInitialized.current = true;

      // 레벨 변경 시 애니메이션 비활성화로 잔상 방지
      const originalSetLevel = map.setLevel;
      map.setLevel = function (level, options) {
        const newOptions = { ...options, animate: false };
        return originalSetLevel.call(this, level, newOptions);
      };

      setRenderedMap(map);

      // 전체 오버레이 관리
      const allOverlays = [];
      let overlaysVisible = true;

      // 사진이 들어간 커스텀 마커 생성 함수
      const createPhotoMarker = (photoUrl, clickHandler) => {
        const markerDiv = document.createElement('div');
        markerDiv.style.cssText = `
          width: 45px;
          height: 80px;
          border-radius: 12px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          overflow: hidden;
          background: white;
          cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = photoUrl;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `;

        markerDiv.appendChild(img);

        if (clickHandler) {
          markerDiv.addEventListener('click', function(event) {
            isMarkerClick = true; // 마커 클릭 플래그 설정
            clickHandler(event);
          });
        }

        return markerDiv;
      };

      // 기본 마커 이미지 (사진이 없을 때)
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
      const imageSize = new window.kakao.maps.Size(64, 69);
      const imageOption = { offset: new window.kakao.maps.Point(27, 69) };
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      // 테스트 사진 마커
      const markerPosition = new window.kakao.maps.LatLng(37.4979, 127.0276); // 서울 강남역
      const testPhotoUrl = 'https://picsum.photos/200/200?random=1'; // 랜덤 테스트 이미지

      // 커스텀 오버레이 콘텐츠 (인스타 스토리 비율 9:16)
      const overlayContent = `
        <div style="
          position: relative;
          width: 270px;
          height: 480px;
          background: white;
          border-radius: 20px;
          border: 3px solid transparent;
          background-image: linear-gradient(white, white), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 20px rgba(240, 148, 51, 0.2);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: slideUp 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: bottom center;
        ">
        <style>
          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(50px) scale(0.8);
              filter: blur(5px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0px);
            }
          }
        </style>
          <div style="
            height: 100%;
            position: relative;
            overflow: hidden;
          ">
            <img src="${testPhotoUrl}" style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            " />
            <!-- 상단 사용자 정보 -->
            <div style="
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              display: flex;
              align-items: center;
              z-index: 2;
            ">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #333;
              ">김</div>
              <div style="
                color: white;
                font-weight: bold;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
              ">김철수</div>
            </div>
            
            <!-- 하단 콘텐츠 -->
            <div style="
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              color: white;
              text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            ">
              <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
              ">테스트 스토리</div>
              <div style="
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 12px;
              ">이곳에서 멋진 추억을 만들었어요! 🌟</div>
              <div style="
                display: flex;
                align-items: center;
                font-size: 14px;
              ">
                <span>❤️ 5</span>
              </div>
            </div>
          </div>
          <div style="
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid white;
          "></div>
        </div>
      `;

      // 커스텀 오버레이 생성
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: markerPosition,
        content: overlayContent,
        xAnchor: 0.5,
        yAnchor: 1.0
      });

      // 기본적으로 오버레이 표시
      customOverlay.setMap(map);
      allOverlays.push(customOverlay);

      // 사진 마커 클릭 이벤트
      let overlayVisible = true;
      const photoMarkerElement = createPhotoMarker(testPhotoUrl, function (event) {
        if (overlayVisible) {
          customOverlay.setMap(null);
          overlayVisible = false;
        } else {
          customOverlay.setMap(map);
          overlayVisible = true;
        }
      });

      const photoMarkerOverlay = new window.kakao.maps.CustomOverlay({
        position: markerPosition,
        content: photoMarkerElement,
        xAnchor: 0.5,
        yAnchor: 0.5
      });
      photoMarkerOverlay.setMap(map);

      // 마커 클릭 플래그
      let isMarkerClick = false;

      // 맵 클릭 이벤트 (새 스토리 작성)
      window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        // 마커 클릭인 경우 무시
        if (isMarkerClick) {
          isMarkerClick = false;
          return;
        }

        const latlng = mouseEvent.latLng;
        const latitude = latlng.getLat();
        const longitude = latlng.getLng();
        
        // 오른쪽 패널에 좌표 입력
        window.setLocationFromMap?.(latitude, longitude);
        
        // 지도 클릭으로 스토리 생성 기능 (주석처리)
        /*
          // 새 사진 마커 생성
          const newPhotoUrl = `https://picsum.photos/200/200?random=${Date.now()}`; // 랜덤 사진
          
          // 새 사진 마커 클릭 이벤트
          let newOverlayVisible = true;
          const newPhotoMarkerElement = createPhotoMarker(newPhotoUrl, function(event) {
            if (newOverlayVisible) {
              newCustomOverlay.setMap(null);
              newOverlayVisible = false;
            } else {
              newCustomOverlay.setMap(map);
              newOverlayVisible = true;
            }
          });
          
          const newPhotoMarkerOverlay = new window.kakao.maps.CustomOverlay({
            position: latlng,
            content: newPhotoMarkerElement,
            xAnchor: 0.5,
            yAnchor: 0.5
          });
          newPhotoMarkerOverlay.setMap(map);
          
          // 새 스토리 오버레이 (인스타 스토리 비율 9:16)
          const newOverlayContent = `
            <div style="
              position: relative;
              width: 270px;
              height: 480px;
              background: white;
              border-radius: 20px;
              border: 3px solid transparent;
              background-image: linear-gradient(white, white), linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
              background-origin: border-box;
              background-clip: padding-box, border-box;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 20px rgba(240, 148, 51, 0.2);
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              animation: bounceIn 0.5s ease-out;
            ">
            <style>
              @keyframes bounceIn {
                0% {
                  opacity: 0;
                  transform: translateY(40px) scale(0.7);
                  filter: blur(8px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                  filter: blur(0px);
                }
              }
            </style>
              <div style="
                height: 100%;
                position: relative;
                overflow: hidden;
              ">
                <img src="${newPhotoUrl}" style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                " />
                <!-- 상단 사용자 정보 -->
                <div style="
                  position: absolute;
                  top: 20px;
                  left: 20px;
                  right: 20px;
                  display: flex;
                  align-items: center;
                  z-index: 2;
                ">
                  <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #333;
                  ">나</div>
                  <div style="
                    color: white;
                    font-weight: bold;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                  ">나</div>
                </div>
                
                <!-- 하단 콘텐츠 -->
                <div style="
                  position: absolute;
                  bottom: 20px;
                  left: 20px;
                  right: 20px;
                  color: white;
                  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                ">
                  <div style="
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 8px;
                  ">새 스토리</div>
                  <div style="
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 12px;
">클릭한 위치의 스토리</div>
                  <div style="
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                  ">
                    <span>❤️ 0</span>
                  </div>
                </div>
              </div>
              <div style="
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 10px solid white;
              "></div>
            </div>
          `;

          const newCustomOverlay = new window.kakao.maps.CustomOverlay({
            position: latlng,
            content: newOverlayContent,
            xAnchor: 0.5,
            yAnchor: 1.2
          });

          // 새 오버레이 기본 표시
          newCustomOverlay.setMap(map);
          allOverlays.push(newCustomOverlay);
        */


          
      });

      // 전체 오버레이 토글 버튼 생성
      const toggleButton = document.createElement('button');
      toggleButton.innerHTML = '💬 스토리 카드 끄기';
      toggleButton.style.cssText = `
        position: absolute;
        top: 60px;
        left: 10px;
        z-index: 1000;
        background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(240, 148, 51, 0.3);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        transform: scale(1);
      `;

      // 버튼 호버 이벤트
      toggleButton.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.05) translateY(-2px)';
        this.style.boxShadow = '0 8px 25px rgba(240, 148, 51, 0.5)';
      });

      toggleButton.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1) translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(240, 148, 51, 0.3)';
      });

      // 버튼 클릭 이벤트
      toggleButton.addEventListener('click', function () {
        // 클릭 애니메이션
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = 'scale(1.05) translateY(-2px)';
        }, 100);

        overlaysVisible = !overlaysVisible;

        // 스토리 카드들에 페이드 애니메이션 적용
        allOverlays.forEach((overlay, index) => {
          setTimeout(() => {
            if (overlaysVisible) {
              overlay.setMap(map);
              // 나타나는 애니메이션
              const overlayElement = overlay.getContent();
              if (overlayElement) {
                const div = document.createElement('div');
                div.innerHTML = overlayElement;
                const cardElement = div.querySelector('div');
                if (cardElement) {
                  cardElement.style.animation = 'fadeInUp 0.5s ease-out';
                }
              }
            } else {
              overlay.setMap(null);
            }
          }, index * 100); // 순차적으로 나타나기
        });

        // 버튼 텍스트 변경 애니메이션
        this.style.opacity = '0.7';
        setTimeout(() => {
          toggleButton.innerHTML = overlaysVisible ? '💬 스토리 카드 끄기' : '💬 스토리 카드 켜기';
          this.style.opacity = '1';
        }, 150);
      });

      // CSS 애니메이션 추가
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      document.head.appendChild(style);

      // 버튼을 맵 컨테이너에 추가
      container.parentElement.appendChild(toggleButton);

      // 전역 변수로 맵과 오버레이 배열 저장
      window.kakaoMap = map;
      window.allOverlays = allOverlays;
      window.createPhotoMarker = createPhotoMarker;
    };

    // 카카오맵 로드 확인
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      // 스크립트 로드 대기
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          window.kakao.maps.load(initMap);
        }
      }, 100);
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 마커 생성 useEffect
  useEffect(() => {
    if (renderedMap === null) {
      return;
    }
    console.log('마커 생성 준비 완료');

    // Main 컴포넌트에서 지도 이동 요청을 받는 함수
    window.moveMapToLocation = (lat, lng) => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        alert('올바른 좌표를 가져올 수 없습니다.');
        return;
      }

      const latlng = new window.kakao.maps.LatLng(latitude, longitude);
      renderedMap.setCenter(latlng);
      renderedMap.setLevel(3); // 줄 레벨로 설정
    };

    // Main 컴포넌트에서 스토리 생성 요청을 받는 함수
    // 지도 클릭 시 좌표를 Main 컴포넌트에 전달하는 함수
    window.setLocationFromMap = (lat, lng) => {
      window.setMapClickLocation?.(lat, lng);
    };

    window.createStoryFromMain = ({ lat, lng, content }) => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        alert('올바른 좌표를 입력해주세요.');
        return;
      }

      const latlng = new window.kakao.maps.LatLng(latitude, longitude);
      const newPhotoUrl = `https://picsum.photos/200/200?random=${Date.now()}`;

      let newOverlayVisible = true;
      const newPhotoMarkerElement = window.createPhotoMarker(newPhotoUrl, function (event) {
        if (newOverlayVisible) {
          newCustomOverlay.setMap(null);
          newOverlayVisible = false;
        } else {
          newCustomOverlay.setMap(renderedMap);
          newOverlayVisible = true;
        }
      });

      const newPhotoMarkerOverlay = new window.kakao.maps.CustomOverlay({
        position: latlng,
        content: newPhotoMarkerElement,
        xAnchor: 0.5,
        yAnchor: 0.5
      });
      newPhotoMarkerOverlay.setMap(renderedMap);

      const newOverlayContent = `
        <div style="
          position: relative;
          width: 270px;
          height: 480px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: bounceIn 0.4s ease-out;
        ">
        <style>
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.8);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        </style>
          <div style="
            height: 100%;
            position: relative;
            overflow: hidden;
          ">
            <img src="${newPhotoUrl}" style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            " />
            <div style="
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              display: flex;
              align-items: center;
              z-index: 2;
            ">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #333;
              ">나</div>
              <div style="
                color: white;
                font-weight: bold;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
              ">나</div>
            </div>
            <div style="
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              color: white;
              text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            ">
              <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
              ">새 스토리</div>
              <div style="
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 12px;
              ">${content}</div>
              <div style="
                display: flex;
                align-items: center;
                font-size: 14px;
              ">
                <span>❤️ 0</span>
              </div>
            </div>
          </div>
          <div style="
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid white;
          "></div>
        </div>
      `;

      const newCustomOverlay = new window.kakao.maps.CustomOverlay({
        position: latlng,
        content: newOverlayContent,
        xAnchor: 0.5,
        yAnchor: 1.0
      });

      newCustomOverlay.setMap(renderedMap);
      window.allOverlays.push(newCustomOverlay);
      renderedMap.setCenter(latlng);
      alert('스토리가 생성되었습니다!');
    };
  }, [renderedMap]);

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      height: '100%',
      overflow: 'hidden',
      isolation: 'isolate'
    }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          contain: 'layout style paint'
        }}
      />
    </div>
  );
}

export default Map;