import React, { useState, useEffect } from 'react';
import { reviewAPI, commentAPI } from '../services/api';

function MyReviews({ onClose }) {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    loadMyReviews();
    loadMyComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyReviews = async () => {
    try {
      const response = await reviewAPI.getUserReviews(userId);
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    }
  };

  const loadMyComments = async () => {
    try {
      const response = await commentAPI.getUserComments(userId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translate3d(0, 20px, 0) scale(0.96); opacity: 0; }
          to { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)',
        animation: 'modalFadeIn 0.2s ease-out'
      }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 240, 0.95) 100%)',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        animation: 'modalSlideUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform, opacity'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
          padding: '24px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              backdropFilter: 'blur(10px)'
            }}>⭐</div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
                내 활동
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                리뷰 {reviews.length}개 · 댓글 {comments.length}개
              </p>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'reviews' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                color: activeTab === 'reviews' ? '#ff9800' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              📝 내 리뷰 ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'comments' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                color: activeTab === 'comments' ? '#ff9800' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              💬 내 댓글 ({comments.length})
            </button>
          </div>

          <button onClick={onClose} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'white',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.5)';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'rotate(0deg)';
          }}>✕</button>
        </div>

        {/* 콘텐츠 */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(80vh - 180px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
          transform: 'translateZ(0)'
        }}>
          {activeTab === 'reviews' ? (
            reviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                <p style={{ fontSize: '16px', margin: 0 }}>아직 작성한 리뷰가 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((review) => (
                  <div key={review.review_id} style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '2px solid rgba(255, 193, 7, 0.2)',
                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.2)';
                  }}
                  onClick={() => {
                    if (review.latitude && review.longitude) {
                      window.moveMapToLocation?.(review.latitude, review.longitude);
                    }
                    if (review.place_id && review.place_name) {
                      window.openPlaceModal?.(review.place_id, review.place_name);
                    }
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                      }}>⭐</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {review.title}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#ff9800',
                          fontWeight: '700',
                          marginBottom: '8px'
                        }}>
                          ⭐ {review.rating}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#999',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span>📍 {review.place_name || '장소 정보 없음'}</span>
                          <span>📅 {new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            comments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <p style={{ fontSize: '16px', margin: 0 }}>아직 작성한 댓글이 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.map((comment) => (
                  <div key={comment.comment_id} style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.9) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '2px solid rgba(255, 193, 7, 0.2)',
                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.2)';
                  }}
                  onClick={() => {
                    if (comment.latitude && comment.longitude) {
                      window.moveMapToLocation?.(comment.latitude, comment.longitude);
                    }
                    if (comment.place_id && comment.place_name) {
                      window.openPlaceModal?.(comment.place_id, comment.place_name);
                    }
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                      }}>💬</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px',
                          lineHeight: '1.5',
                          wordBreak: 'break-word'
                        }}>
                          {comment.content}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#999',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span>📍 {comment.place_name || '장소 정보 없음'}</span>
                          <span>📅 {new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default MyReviews;
