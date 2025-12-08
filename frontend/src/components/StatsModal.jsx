import React, { useState } from 'react';
import { statsAPI, storyAPI } from '../services/api';

function StatsModal({ onClose, onMoveToLocation }) {
  const [activeTab, setActiveTab] = useState('popular');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [placeInput, setPlaceInput] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceSearch = async (query) => {
    if (!query || query.length < 1) {
      setPlaceSuggestions([]);
      return;
    }
    try {
      const response = await statsAPI.searchPlacesByName(query);
      setPlaceSuggestions(response.places || []);
    } catch (error) {
      console.error('장소 검색 실패:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'popular':
          const minLikes = searchInput && !isNaN(parseInt(searchInput)) ? parseInt(searchInput) : 0;
          response = await statsAPI.getPopularStories(minLikes);
          setResults(response.stories || []);
          break;
        case 'highRated':
          const minRating = searchInput && !isNaN(parseFloat(searchInput)) ? parseFloat(searchInput) : 0;
          response = await statsAPI.getHighRatedPlaces(minRating);
          setResults(response.places || []);
          break;
        case 'placeReviews':
          if (!selectedPlace) {
            alert('장소를 선택하세요');
            setLoading(false);
            return;
          }
          response = await statsAPI.searchReviewsByPlace(selectedPlace.name);
          setResults(response.reviews || []);
          break;
        case 'excellent':
          const minExcellent = searchInput && !isNaN(parseFloat(searchInput)) ? parseFloat(searchInput) : 0;
          response = await statsAPI.getExcellentReviews(minExcellent);
          setResults(response.reviews || []);
          break;
        case 'byRating':
          if (!searchInput || !searchInput.trim() || isNaN(parseFloat(searchInput))) {
            alert('평점을 입력하세요 (0-5)');
            setLoading(false);
            return;
          }
          response = await statsAPI.getReviewsByRating(parseFloat(searchInput));
          setResults(response.reviews || []);
          break;
        case 'placeSearch':
          if (!selectedPlace) {
            alert('장소를 선택하세요');
            setLoading(false);
            return;
          }
          setResults([selectedPlace]);
          break;
        case 'hotReviews':
          if (!selectedPlace) {
            alert('장소를 선택하세요');
            setLoading(false);
            return;
          }
          response = await statsAPI.getHotReviews(selectedPlace.place_id);
          setResults(response.reviews || []);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
    if (results.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>결과가 없습니다</div>;

    if (activeTab === 'popular') {
      return results.map((story, idx) => (
        <div key={idx} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          border: '2px solid rgba(102, 126, 234, 0.2)',
          cursor: 'pointer'
        }}
          onClick={async () => {
            try {
              const response = await storyAPI.getStoryById(story.story_id);
              if (onMoveToLocation && response.latitude && response.longitude) {
                onMoveToLocation(response.latitude, response.longitude);
              }
              window.openStoryModal?.(response);
            } catch (error) {
              console.error('스토리 불러오기 실패:', error);
            }
          }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>{story.content}</div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            ❤️ {story.likes} · 👤 {story.user_name}
          </div>
        </div>
      ));
    }

    if (activeTab === 'highRated' || activeTab === 'placeSearch') {
      return results.map((place, idx) => (
        <div key={idx} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          border: '2px solid rgba(102, 126, 234, 0.2)',
          cursor: 'pointer'
        }}
          onClick={() => {
            if (onMoveToLocation && place.latitude && place.longitude) {
              onMoveToLocation(place.latitude, place.longitude);
            }
            window.openPlaceModal?.(place.place_id, place.name);
          }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>📍 {place.name}</div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            ⭐ {place.average_rating} · 리뷰 {place.review_count}개
          </div>
        </div>
      ));
    }

    if (activeTab === 'hotReviews') {
      return results.map((review, idx) => (
        <div key={idx} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          border: '2px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>{review.title}</div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            ⭐ {review.rating} · 💬 {review.comment_count}개
          </div>
        </div>
      ));
    }

    return results.map((review, idx) => (
      <div key={idx} style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        border: '2px solid rgba(102, 126, 234, 0.2)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>{review.title}</div>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>{review.content}</div>
        <div style={{ fontSize: '13px', color: '#999' }}>
          ⭐ {review.rating} · 📍 {review.place_name}
        </div>
      </div>
    ));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 245, 255, 0.95) 100%)',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          position: 'relative'
        }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
            🔍 검색 & 통계
          </h2>
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'white'
          }}>✕</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(80vh - 96px)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>📚 스토리 & 장소</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button onClick={() => { setActiveTab('popular'); setResults([]); setSearchInput(''); }} style={{
                padding: '8px 16px',
                background: activeTab === 'popular' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'popular' ? 'white' : '#333',
                border: activeTab === 'popular' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'popular' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>🔥 인기 스토리</button>
              <button onClick={() => { setActiveTab('highRated'); setResults([]); setSearchInput(''); }} style={{
                padding: '8px 16px',
                background: activeTab === 'highRated' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'highRated' ? 'white' : '#333',
                border: activeTab === 'highRated' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'highRated' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>⭐ 평점 높은 장소</button>
              <button onClick={() => { setActiveTab('placeSearch'); setResults([]); setPlaceInput(''); setSelectedPlace(null); }} style={{
                padding: '8px 16px',
                background: activeTab === 'placeSearch' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'placeSearch' ? 'white' : '#333',
                border: activeTab === 'placeSearch' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'placeSearch' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>📍 장소 검색</button>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>📝 리뷰</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => { setActiveTab('placeReviews'); setResults([]); setPlaceInput(''); setSelectedPlace(null); }} style={{
                padding: '8px 16px',
                background: activeTab === 'placeReviews' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'placeReviews' ? 'white' : '#333',
                border: activeTab === 'placeReviews' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'placeReviews' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>📍 장소별 리뷰</button>
              <button onClick={() => { setActiveTab('excellent'); setResults([]); setSearchInput(''); }} style={{
                padding: '8px 16px',
                background: activeTab === 'excellent' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'excellent' ? 'white' : '#333',
                border: activeTab === 'excellent' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'excellent' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>🏆 우수 리뷰</button>
              <button onClick={() => { setActiveTab('byRating'); setResults([]); setSearchInput(''); }} style={{
                padding: '8px 16px',
                background: activeTab === 'byRating' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'byRating' ? 'white' : '#333',
                border: activeTab === 'byRating' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'byRating' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>🌟 평점별 리뷰</button>
              <button onClick={() => { setActiveTab('hotReviews'); setResults([]); setPlaceInput(''); setSelectedPlace(null); }} style={{
                padding: '8px 16px',
                background: activeTab === 'hotReviews' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#f0f0f0',
                color: activeTab === 'hotReviews' ? 'white' : '#333',
                border: activeTab === 'hotReviews' ? 'none' : '2px solid #e0e0e0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: activeTab === 'hotReviews' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}>🔥 핫 리뷰</button>
            </div>
          </div>

          {(activeTab === 'placeReviews' || activeTab === 'placeSearch' || activeTab === 'hotReviews') && (
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              {activeTab === 'hotReviews' && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  💡 사용자가 입력한 장소에 달린 리뷰 중에서 댓글이 존재하는 리뷰만을 출력합니다
                </div>
              )}
              <input
                value={placeInput}
                onChange={(e) => {
                  setPlaceInput(e.target.value);
                  handlePlaceSearch(e.target.value);
                }}
                placeholder="장소 이름 입력"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {placeSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {placeSuggestions.map((place, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedPlace(place);
                        setPlaceInput(place.name);
                        setPlaceSuggestions([]);
                      }}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: idx < placeSuggestions.length - 1 ? '1px solid #e0e0e0' : 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <div style={{ fontWeight: '600' }}>{place.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        ⭐ {place.average_rating} · 리뷰 {place.review_count}개
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'popular' || activeTab === 'highRated' || activeTab === 'excellent' || activeTab === 'byRating') && (
            <div style={{ marginBottom: '20px' }}>
              {activeTab === 'excellent' && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  💡 "전체 리뷰의 평균 평점 + 입력한 값"보다 높은 리뷰만 표시됩니다
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    activeTab === 'popular' ? '최소 좋아요 수 (비우면 모두)' :
                      activeTab === 'highRated' ? '최소 평점 (비우면 모두)' :
                        activeTab === 'excellent' ? '최소 평점 (비우면 모두)' :
                          activeTab === 'byRating' ? '평점 입력 (예: 4.5)' :
                            '검색어 입력'
                  }
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          )}

          <button onClick={handleSearch} style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '20px'
          }}>검색</button>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {renderResults()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;
