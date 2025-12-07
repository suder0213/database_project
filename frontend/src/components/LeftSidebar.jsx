import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';
import MyStories from './MyStories';
import MyReviews from './MyReviews';
import MyLikes from './MyLikes';
import { checkAuthStatus } from '../utils/auth';
import { tagAPI } from '../services/api';

function LeftSidebar({ showSidebar, setShowSidebar, sidebarOpacity, setSidebarOpacity, onMoveToLocation }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showMyStories, setShowMyStories] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [showMyLikes, setShowMyLikes] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const isLoggedIn = checkAuthStatus();

  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      const response = await tagAPI.getAllTags();
      setAllTags(response.tags || []);
    } catch (error) {
      console.error('태그 불러오기 실패:', error);
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

      {isLoggedIn && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowProfile(true)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            👤 내 프로필
          </button>
          <button
            onClick={() => setShowMyStories(true)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            📖 내 스토리
          </button>
          <button
            onClick={() => setShowMyReviews(true)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ⭐ 내 리뷰/댓글
          </button>
          <button
            onClick={() => setShowMyLikes(true)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#ff6b9d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ❤️ 좋아요한 스토리
          </button>
        </div>
      )}

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
                  onClick={async () => {
                    try {
                      const response = await tagAPI.getTagStories(tag.tag_id);
                      console.log(`#${tag.name} 태그 전체 응답:`, response);
                      console.log('story_ids:', response.story_ids);
                      const count = response.story_ids?.length || 0;
                      alert(`#${tag.name} 태그의 스토리 ${count}개 발견!`);
                      setTagSearch('');
                    } catch (error) {
                      console.error('태그 스토리 검색 실패:', error);
                    }
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
    </div>
  );
}

export default LeftSidebar;