import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';
import MyStories from './MyStories';
import MyReviews from './MyReviews';
import MyLikes from './MyLikes';
import StatsModal from './StatsModal';
import { checkAuthStatus } from '../utils/auth';
import { tagAPI, statsAPI } from '../services/api';

function LeftSidebar({ showSidebar, setShowSidebar, sidebarOpacity, setSidebarOpacity, onMoveToLocation }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showMyStories, setShowMyStories] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [showMyLikes, setShowMyLikes] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [userStats, setUserStats] = useState(null);
  const isLoggedIn = checkAuthStatus();

  useEffect(() => {
    loadAllTags();
    if (isLoggedIn) {
      loadUserStats();
    } else {
      setUserStats(null);
    }

    const handleReviewCreated = () => {
      loadUserStats();
    };
    const handleStoryChanged = () => {
      loadUserStats();
    };
    
    window.addEventListener('reviewCreated', handleReviewCreated);
    window.addEventListener('storyChanged', handleStoryChanged);

    return () => {
      window.removeEventListener('reviewCreated', handleReviewCreated);
      window.removeEventListener('storyChanged', handleStoryChanged);
    };
  }, [isLoggedIn]);

  const loadAllTags = async () => {
    try {
      const response = await tagAPI.getAllTags();
      setAllTags(response.tags || []);
    } catch (error) {
      console.error('태그 불러오기 실패:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const response = await statsAPI.getUserStats(userId);
        setUserStats(response);
      }
    } catch (error) {
      console.error('사용자 통계 불러오기 실패:', error);
    }
  };

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '400px',
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

      {isLoggedIn && userStats && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '12px',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#667eea',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 내 활동 요약
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>📖 작성한 스토리</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>{userStats.story_count || 0}개</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>⭐ 평균 리뷰 평점</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#ffd700' }}>
                {userStats.average_review_rating && userStats.average_review_rating > 0 ? userStats.average_review_rating.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowProfile(true)}
            style={{
              padding: '20px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05) rotate(-2deg)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            👤 프로필
          </button>
          <button
            onClick={() => setShowMyStories(true)}
            style={{
              padding: '20px 12px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05) rotate(2deg)';
              e.target.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.3)';
            }}
          >
            📖 작성한 스토리
          </button>
          <button
            onClick={() => setShowMyReviews(true)}
            style={{
              padding: '20px 12px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05) rotate(2deg)';
              e.target.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
            }}
          >
            ⭐ 작성한 리뷰/댓글
          </button>
          <button
            onClick={() => setShowMyLikes(true)}
            style={{
              padding: '20px 12px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05) rotate(-2deg)';
              e.target.style.boxShadow = '0 8px 25px rgba(250, 112, 154, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 4px 15px rgba(250, 112, 154, 0.3)';
            }}
          >
            ❤️ 좋아요한 스토리
          </button>
        </div>
      )}

      <div style={{
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button
          onClick={() => setShowStats(true)}
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px) scale(1.03)';
            e.target.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)';
          }}
        >
          🔍 검색 & 통계
        </button>
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
        }}>🏷️ 태그 검색</h3>
        <div style={{ position: 'relative' }}>
          <input
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder="태그 검색..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {tagSearch && filteredTags.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10
            }}>
              {filteredTags.map((tag) => (
                <div
                  key={tag.tag_id}
                  onClick={() => {
                    window.openTagStoriesModal?.(tag.tag_id, tag.name);
                    setTagSearch('');
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f5f5ff'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  #{tag.name}
                </div>
              ))}
            </div>
          )}
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

      {/* 모달들 */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
      {showMyStories && (
        <MyStories onClose={() => setShowMyStories(false)} onMoveToLocation={onMoveToLocation} />
      )}
      {showMyReviews && (
        <MyReviews onClose={() => setShowMyReviews(false)} />
      )}
      {showMyLikes && (
        <MyLikes onClose={() => setShowMyLikes(false)} onMoveToLocation={onMoveToLocation} />
      )}
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} onMoveToLocation={onMoveToLocation} />
      )}
    </div>
  );
}

export default LeftSidebar;