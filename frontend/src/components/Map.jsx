import React, { useEffect, useRef, useState } from 'react';
import { storyAPI, placeAPI, reviewAPI, likeAPI } from '../services/api';

function Map({ user }) {
  const mapRef = useRef(null);
  const [renderedMap, setRenderedMap] = useState(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    // 카카오맵 SDK 동적 로딩
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&autoload=false`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('카카오맵 SDK 로딩 실패'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadKakaoMapScript();
        
        // 카카오맵 SDK 수동 초기화
        await new Promise((resolve) => {
          window.kakao.maps.load(resolve);
        });
        
      } catch (error) {
        console.error('카카오맵 로딩 실패:', error);
        return;
      }
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
        center: new window.kakao.maps.LatLng(37.4979, 127.0276),
        level: 3,
        draggable: true,
        scrollwheel: true
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('맵 생성 성공! - ID:', Date.now());
      mapInitialized.current = true;



      setRenderedMap(map);

      // 전체 오버레이 관리
      const allOverlays = [];
      const allMarkers = [];
      let overlaysVisible = true;
      let storyMarkersVisible = true;
      let placeMarkersVisible = true;
      let isMarkerClick = false;

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
          background: #667eea;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        `;

        if (photoUrl && photoUrl !== 'null' && photoUrl !== 'undefined' && photoUrl !== '') {
          const img = document.createElement('img');
          img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.2s;
          `;
          
          img.onload = function() {
            this.style.opacity = '1';
          };
          
          img.onerror = function() {
            this.style.display = 'none';
            markerDiv.innerHTML = '📸';
          };
          
          img.src = photoUrl;
          markerDiv.appendChild(img);
        } else {
          markerDiv.innerHTML = '📸';
        }

        if (clickHandler) {
          markerDiv.addEventListener('click', function (event) {
            isMarkerClick = true;
            clickHandler(event);
          });
        }

        return markerDiv;
      };

      // 스토리 오버레이 HTML 생성
      const createStoryOverlay = (story) => {
        const imageUrl = story.image_url && story.image_url !== 'null' && story.image_url !== 'undefined' ? story.image_url : '';
        const userName = story.user_name || '익명';
        const content = story.content || '';
        const likes = story.likes || 0;
        const createdAt = story.created_at ? new Date(story.created_at).toLocaleDateString() : '';

        const overlayDiv = document.createElement('div');
        overlayDiv.style.cssText = `
          position: relative;
          width: 270px;
          height: 480px;
          background: white;
          border-radius: 20px;
          border: 3px solid #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        `;
        
        overlayDiv.innerHTML = `
          <div style="
            height: 100%;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 80px;
          ">
            ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;" />` : '📸'}
            <div style="
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              display: flex;
              align-items: center;
              z-index: 2;
              background: rgba(255, 255, 255, 0.9);
              padding: 8px 12px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            ">
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: white;
                margin-right: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #667eea;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              ">${userName.charAt(0).toUpperCase()}</div>
              <div style="
                color: #333;
                font-weight: 600;
                font-size: 15px;
              ">${userName}</div>
            </div>
            
            <div style="
              position: absolute;
              bottom: 10px;
              left: 10px;
              right: 10px;
              background: rgba(255, 255, 255, 0.9);
              padding: 12px;
              border-radius: 12px;
              backdrop-filter: blur(10px);
              max-height: 180px;
              overflow: hidden;
            ">
              <div style="
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 12px;
                color: #333;
                word-wrap: break-word;
                overflow-wrap: break-word;
                display: -webkit-box;
                -webkit-line-clamp: 6;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${content}</div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                color: #666;
              ">
                <span id="like-count-${story.story_id}">❤️ ${likes}</span>
                <span style="font-size: 12px;">${createdAt}</span>
              </div>
            </div>
            <div id="like-animation-${story.story_id}" style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 80px;
              opacity: 0;
              pointer-events: none;
              z-index: 10;
            ">❤️</div>
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
        `;
        
        // 클릭 모달 열기
        let clickTimeout;
        overlayDiv.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            return;
          }
          
          clickTimeout = setTimeout(() => {
            clickTimeout = null;
            window.openStoryModal?.(story);
          }, 250);
        });
        
        // 더블클릭 좋아요 기능
        overlayDiv.addEventListener('dblclick', async function(e) {
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          e.preventDefault();
          e.stopPropagation();
          
          // 테스트 마커는 좋아요 기능 비활성화
          if (story.story_id === 999) {
            console.log('테스트 마커는 좋아요를 지원하지 않습니다.');
            return;
          }
          
          const userId = localStorage.getItem('user_id');
          if (!userId) {
            alert('로그인이 필요합니다.');
            return;
          }
          
          try {
            console.log('좋아요 요청:', { story_id: story.story_id, user_id: userId });
            const response = await likeAPI.toggleLike(story.story_id);
            console.log('좋아요 응답:', response);
            
            if (response.success) {
              // 좋아요 수 업데이트
              const likeCountEl = document.getElementById(`like-count-${story.story_id}`);
              if (likeCountEl) {
                likeCountEl.textContent = `❤️ ${response.total_likes}`;
              }
              
              // 하트 애니메이션 (좋아요/취소에 따라 다른 애니메이션)
              const heartAnim = document.getElementById(`like-animation-${story.story_id}`);
              if (heartAnim) {
                if (response.liked) {
                  // 좋아요 추가: 하트 터지기
                  heartAnim.textContent = '❤️';
                  heartAnim.style.animation = 'heartBurst 0.6s ease-out';
                } else {
                  // 좋아요 취소: 깨진 하트
                  heartAnim.textContent = '💔';
                  heartAnim.style.animation = 'heartBreak 0.6s ease-out';
                }
                heartAnim.style.opacity = '1';
                setTimeout(() => {
                  heartAnim.style.opacity = '0';
                  heartAnim.style.animation = '';
                }, 600);
              }
            }
          } catch (error) {
            console.error('좋아요 실패:', error);
            console.error('에러 상세:', error.response?.data);
            console.error('에러 상태:', error.response?.status);
            alert('좋아요 처리에 실패했습니다: ' + (error.response?.data?.detail || error.message));
          }
        });
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('heart-animation-style')) {
          const style = document.createElement('style');
          style.id = 'heart-animation-style';
          style.textContent = `
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
          `;
          document.head.appendChild(style);
        }
        
        return overlayDiv;
      };

      // 위치 기반 스토리 불러오기 (bounds 사용)
      const loadNearbyStories = async () => {
        if (!storyMarkersVisible) return;
        
        try {
          // 지도의 현재 영역 가져오기
          const bounds = map.getBounds();
          const swLatLng = bounds.getSouthWest(); // 남서쪽
          const neLatLng = bounds.getNorthEast(); // 북동쪽
          
          const swLat = swLatLng.getLat();
          const swLng = swLatLng.getLng();
          const neLat = neLatLng.getLat();
          const neLng = neLatLng.getLng();
          
          console.log(`🗺️ 지도 영역: SW(${swLat}, ${swLng}) ~ NE(${neLat}, ${neLng})`);

          const response = await storyAPI.getNearbyStoriesByBounds(swLat, swLng, neLat, neLng);
          const stories = response.stories || [];
          
          console.log(`📍 스토리 ${stories.length}개 로드됨:`, stories);
          console.log('API 응답 전체:', response);

          // 기존 마커 유지 및 새 마커 추가/제거
          const existingStoryIds = new Set(allMarkers.filter(m => !m._testMarker).map(m => m._storyId));
          const newStoryIds = new Set(stories.map(s => s.story_id));
          
          // 화면에서 벗어난 스토리 마커만 제거
          for (let i = allMarkers.length - 1; i >= 0; i--) {
            if (allMarkers[i]._storyId && !allMarkers[i]._testMarker && !newStoryIds.has(allMarkers[i]._storyId)) {
              allMarkers[i].setMap(null);
              allMarkers.splice(i, 1);
            }
          }
          
          for (let i = allOverlays.length - 1; i >= 0; i--) {
            if (allOverlays[i]._storyId && !allOverlays[i]._testMarker && !newStoryIds.has(allOverlays[i]._storyId)) {
              allOverlays[i].setMap(null);
              allOverlays.splice(i, 1);
            }
          }

          if (stories.length === 0) {
            console.log('⚠️ DB에 스토리가 없습니다. 테스트 마커만 표시됩니다.');
            return;
          }

          // 새로운 스토리만 마커 생성 (배치 처리)
          const newMarkers = [];
          const newOverlays = [];
          
          stories.forEach((story) => {
            if (existingStoryIds.has(story.story_id)) return;
            
            const position = new window.kakao.maps.LatLng(story.latitude, story.longitude);
            let imageUrl = story.image_url;
            if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
              imageUrl = '';
            }

            const overlayContent = createStoryOverlay(story);
            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: overlayContent,
              xAnchor: 0.5,
              yAnchor: 1.0
            });
            customOverlay._storyId = story.story_id;
            newOverlays.push(customOverlay);

            let overlayVisible = false;
            const photoMarkerElement = createPhotoMarker(imageUrl, function () {
              overlayVisible = !overlayVisible;
              customOverlay.setMap(overlayVisible ? map : null);
            });

            const photoMarkerOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: photoMarkerElement,
              xAnchor: 0.5,
              yAnchor: 0.5
            });
            photoMarkerOverlay._storyId = story.story_id;
            newMarkers.push(photoMarkerOverlay);
          });
          
          // 배치로 한번에 추가 (토글 상태 확인)
          requestAnimationFrame(() => {
            newMarkers.forEach(marker => {
              if (storyMarkersVisible) {
                marker.setMap(map);
              }
            });
            allMarkers.push(...newMarkers);
            allOverlays.push(...newOverlays);
          });
          
          console.log(`✅ 총 ${stories.length}개 스토리 마커 생성 완료`);
        } catch (error) {
          console.error('❌ 스토리 로딩 실패:', error);
          console.error('에러 상세:', error.response?.data || error.message);
        }
      };



      // 초기 스토리 로드
      loadNearbyStories();
      
      // 장소 마커 로드 (최적화)
      const loadNearbyPlaces = async () => {
        if (!placeMarkersVisible) return;
        
        try {
          const bounds = map.getBounds();
          const swLatLng = bounds.getSouthWest();
          const neLatLng = bounds.getNorthEast();
          
          console.log(`📍 장소 검색 영역: SW(${swLatLng.getLat()}, ${swLatLng.getLng()}) ~ NE(${neLatLng.getLat()}, ${neLatLng.getLng()})`);
          
          const response = await placeAPI.searchPlacesByBounds(
            swLatLng.getLat(), swLatLng.getLng(),
            neLatLng.getLat(), neLatLng.getLng()
          );
          const places = response.places || [];
          
          console.log(`📍 장소 ${places.length}개 로드됨:`, places);
          
          const existingPlaceIds = new Set(allMarkers.filter(m => m._placeId).map(m => m._placeId));
          const newPlaceIds = new Set(places.map(p => p.place_id));
          
          // 화면에서 벗어난 장소 마커 제거
          for (let i = allMarkers.length - 1; i >= 0; i--) {
            if (allMarkers[i]._placeId && !newPlaceIds.has(allMarkers[i]._placeId)) {
              allMarkers[i].setMap(null);
              allMarkers.splice(i, 1);
            }
          }
          
          for (let i = allOverlays.length - 1; i >= 0; i--) {
            if (allOverlays[i]._placeId && !newPlaceIds.has(allOverlays[i]._placeId)) {
              allOverlays[i].setMap(null);
              allOverlays.splice(i, 1);
            }
          }
          
          // 배치 처리
          const newPlaceMarkers = [];
          const newPlaceOverlays = [];
          
          places.forEach((place) => {
            if (existingPlaceIds.has(place.place_id)) return;
            
            const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);
            
            const placeOverlayDiv = document.createElement('div');
            placeOverlayDiv.style.cssText = `
              padding: 15px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              min-width: 200px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              cursor: pointer;
            `;
            placeOverlayDiv.innerHTML = `
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #333;">📍 ${place.name}</div>
              <div style="font-size: 13px; color: #666;">⭐ ${place.average_rating || 'N/A'}</div>
            `;
            

            placeOverlayDiv.addEventListener('click', function() {
              window.openPlaceModal?.(place.place_id, place.name);
            });
            
            const placeCustomOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: placeOverlayDiv,
              xAnchor: 0.5,
              yAnchor: 1.3
            });
            placeCustomOverlay._placeId = place.place_id;
            newPlaceOverlays.push(placeCustomOverlay);
            
            const placeMarker = document.createElement('div');
            placeMarker.innerHTML = '📍';
            placeMarker.style.cssText = `
              font-size: 32px;
              cursor: pointer;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              transition: transform 0.2s;
            `;
            
            let placeVisible = false;
            placeMarker.addEventListener('click', function() {
              isMarkerClick = true;
              placeVisible = !placeVisible;
              placeCustomOverlay.setMap(placeVisible ? map : null);
            });
            
            const placeMarkerOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: placeMarker,
              xAnchor: 0.5,
              yAnchor: 0.5
            });
            placeMarkerOverlay._placeId = place.place_id;
            newPlaceMarkers.push(placeMarkerOverlay);
          });
          
          // 배치로 한번에 추가
          requestAnimationFrame(() => {
            if (placeMarkersVisible) {
              newPlaceMarkers.forEach(marker => marker.setMap(map));
            }
            allMarkers.push(...newPlaceMarkers);
            allOverlays.push(...newPlaceOverlays);
          });
          
          console.log(`✅ 총 ${places.length}개 장소 마커 생성 완료`);
        } catch (error) {
          console.error('❌ 장소 로딩 실패:', error);
          console.error('에러 상세:', error.response?.data || error.message);
        }
      };
      
      setTimeout(() => loadNearbyPlaces(), 500);

      // 지도 이동 시 스토리/장소 로드
      let idleTimeout;
      let isLoading = false;
      
      window.kakao.maps.event.addListener(map, 'idle', function() {
        if (isLoading) return;
        
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          isLoading = true;
          Promise.all([loadNearbyStories(), loadNearbyPlaces()]).finally(() => {
            setTimeout(() => { isLoading = false; }, 500);
          });
        }, 2000);
      });

      // 맵 클릭 이벤트 (새 스토리 작성)
      window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
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

      // 스토리 마커 토글 버튼
      const storyMarkerButton = document.createElement('button');
      storyMarkerButton.innerHTML = '📸 스토리 끄기';
      storyMarkerButton.style.cssText = `
        position: absolute;
        top: 60px;
        left: 10px;
        z-index: 1000;
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s;
      `;
      
      storyMarkerButton.addEventListener('click', function() {
        storyMarkersVisible = !storyMarkersVisible;
        allMarkers.forEach(marker => {
          if (marker._storyId) {
            marker.setMap(storyMarkersVisible ? map : null);
          }
        });
        this.innerHTML = storyMarkersVisible ? '📸 스토리 끄기' : '📸 스토리 켜기';
      });
      
      // 장소 마커 토글 버튼
      const placeMarkerButton = document.createElement('button');
      placeMarkerButton.innerHTML = '📍 장소 끄기';
      placeMarkerButton.style.cssText = `
        position: absolute;
        top: 110px;
        left: 10px;
        z-index: 1000;
        background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s;
      `;
      
      placeMarkerButton.addEventListener('click', function() {
        placeMarkersVisible = !placeMarkersVisible;
        allMarkers.forEach(marker => {
          if (marker._placeId) {
            marker.setMap(placeMarkersVisible ? map : null);
          }
        });
        this.innerHTML = placeMarkersVisible ? '📍 장소 끄기' : '📍 장소 켜기';
      });
      
      // 전체 오버레이 토글 버튼 생성
      const toggleButton = document.createElement('button');
      toggleButton.innerHTML = '💬 스토리 카드 끄기';
      toggleButton.style.cssText = `
        position: absolute;
        top: 160px;
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

        // 스토리 카드 토글 (즉시 처리)
        allOverlays.forEach((overlay) => {
          overlay.setMap(overlaysVisible ? map : null);
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
      container.parentElement.appendChild(storyMarkerButton);
      container.parentElement.appendChild(placeMarkerButton);
      container.parentElement.appendChild(toggleButton);

      // 지도 타입 변경 기능
      let currentTypeId = null;
      
      const setOverlayMapTypeId = (maptype) => {
        let changeMaptype;
        
        if (maptype === 'traffic') {
          changeMaptype = window.kakao.maps.MapTypeId.TRAFFIC;
        } else if (maptype === 'terrain') {
          changeMaptype = window.kakao.maps.MapTypeId.TERRAIN;
        } else if (maptype === 'bicycle') {
          changeMaptype = window.kakao.maps.MapTypeId.BICYCLE;
        } else if (maptype === 'use_district') {
          changeMaptype = window.kakao.maps.MapTypeId.USE_DISTRICT;
        }
        
        if (currentTypeId) {
          map.removeOverlayMapTypeId(currentTypeId);
        }
        
        if (changeMaptype) {
          map.addOverlayMapTypeId(changeMaptype);
          currentTypeId = changeMaptype;
        } else {
          currentTypeId = null;
        }
      };

      // 지도 타입 버튼들 생성
      const mapTypeButtons = [
        { type: 'traffic', icon: '🚗', label: '교통' },
        { type: 'terrain', icon: '🏔️', label: '지형' },
        { type: 'bicycle', icon: '🚴', label: '자전거' },
        { type: 'use_district', icon: '📍', label: '지적' },
        { type: 'none', icon: '🗺️', label: '기본' }
      ];

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        position: absolute;
        top: 220px;
        left: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;

      mapTypeButtons.forEach((btn, index) => {
        const button = document.createElement('button');
        button.innerHTML = `${btn.icon}<br><span style="font-size: 10px;">${btn.label}</span>`;
        button.style.cssText = `
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(240, 148, 51, 0.3);
          border-radius: 16px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transform: scale(1);
        `;

        // 호버 효과
        button.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.1) translateY(-2px)';
          this.style.background = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
          this.style.color = 'white';
          this.style.borderColor = 'transparent';
          this.style.boxShadow = '0 8px 25px rgba(240, 148, 51, 0.4)';
        });

        button.addEventListener('mouseleave', function() {
          this.style.transform = 'scale(1) translateY(0)';
          this.style.background = 'rgba(255, 255, 255, 0.95)';
          this.style.color = '#333';
          this.style.borderColor = 'rgba(240, 148, 51, 0.3)';
          this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });

        // 클릭 효과
        button.addEventListener('click', function() {
          // 클릭 애니메이션
          this.style.transform = 'scale(0.95)';
          setTimeout(() => {
            this.style.transform = 'scale(1.1) translateY(-2px)';
          }, 100);

          setOverlayMapTypeId(btn.type === 'none' ? null : btn.type);
        });

        buttonContainer.appendChild(button);
      });

      container.parentElement.appendChild(buttonContainer);

      // 장소 마커 강제 새로고침
      window.refreshPlaceMarkers = () => {
        // 모든 장소 마커 제거
        for (let i = allMarkers.length - 1; i >= 0; i--) {
          if (allMarkers[i]._placeId) {
            allMarkers[i].setMap(null);
            allMarkers.splice(i, 1);
          }
        }
        for (let i = allOverlays.length - 1; i >= 0; i--) {
          if (allOverlays[i]._placeId) {
            allOverlays[i].setMap(null);
            allOverlays.splice(i, 1);
          }
        }
        // 다시 로드
        loadNearbyPlaces();
      };

      // 전역 변수로 맵과 오버레이 배열 저장
      window.kakaoMap = map;
      window.allOverlays = allOverlays;
      window.allMarkers = allMarkers;
      window.createPhotoMarker = createPhotoMarker;
      window.loadNearbyStories = loadNearbyStories;
      window.placeAPI = placeAPI;
    };

    // 카카오맵 초기화 시작
    initMap();
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