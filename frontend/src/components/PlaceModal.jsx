import React, { useState, useEffect } from 'react';
import { reviewAPI, commentAPI, placeAPI } from '../services/api';

function PlaceModal({ placeId, placeName, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [placeInfo, setPlaceInfo] = useState({ name: placeName, rating: null });
  const [editingReview, setEditingReview] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (placeId) {
      loadReviews();
      loadPlaceInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  const loadPlaceInfo = async () => {
    try {
      const response = await placeAPI.getPlaceById(placeId);
      setPlaceInfo({ name: response.name, rating: response.average_rating });
    } catch (error) {
      console.error('장소 정보 로드 실패:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getPlaceReviews(placeId);
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    }
  };

  const loadComments = async (reviewId) => {
    try {
      const response = await commentAPI.getReviewComments(reviewId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewTitle.trim()) {
      alert('리뷰 제목을 입력해주세요.');
      return;
    }
    if (!newReview.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    try {
      const reviewData = {
        place_id: placeId,
        title: reviewTitle,
        content: newReview,
        rating: rating
      };
      console.log('리뷰 작성 요청:', reviewData);
      
      await reviewAPI.createReview(reviewData);
      setNewReview('');
      setReviewTitle('');
      setRating(5);
      loadReviews();
      loadPlaceInfo();
      alert('리뷰가 작성되었습니다!');
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      alert('리뷰 작성에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReviewId) return;
    
    try {
      await commentAPI.createComment(selectedReviewId, newComment);
      setNewComment('');
      loadComments(selectedReviewId);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleReviewClick = (reviewId) => {
    if (selectedReviewId === reviewId) {
      setSelectedReviewId(null);
      setComments([]);
    } else {
      setSelectedReviewId(reviewId);
      loadComments(reviewId);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await reviewAPI.deleteReview(reviewId);
        loadReviews();
        loadPlaceInfo();
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  const handleUpdateReview = async () => {
    try {
      await reviewAPI.updateReview(editingReview.review_id, {
        title: editingReview.title,
        content: editingReview.content,
        rating: parseFloat(editingReview.rating)
      });
      setEditingReview(null);
      loadReviews();
      loadPlaceInfo();
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await commentAPI.deleteComment(commentId);
        loadComments(selectedReviewId);
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const handleUpdateComment = async () => {
    try {
      await commentAPI.updateComment(editingComment.comment_id, editingComment.content);
      setEditingComment(null);
      loadComments(selectedReviewId);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
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
      animation: 'modalFadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(5px); }
        }
        @keyframes modalBounce {
          0% { opacity: 0; transform: translateY(-100px) scale(0.3); }
          50% { opacity: 1; transform: translateY(10px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 4px;
          backdrop-filter: blur(10px);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
          transform: scaleY(1.05);
        }
        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, rgba(85, 104, 211, 0.9) 0%, rgba(106, 61, 143, 0.9) 100%);
        }
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(102, 126, 234, 0.6) rgba(255, 255, 255, 0.05);
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(102, 126, 234, 0.2) 100%)',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '650px',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '32px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        animation: 'modalBounce 0.5s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease'
          }}>📍</div>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '2px 2px 0px #667eea, 4px 4px 0px #764ba2',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>{placeInfo.name}</h2>
          {placeInfo.rating !== null && (
            <div style={{
              fontSize: '16px',
              color: '#f0f0f0',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              ⭐ 평균 {placeInfo.rating?.toFixed(1)}점
            </div>
          )}
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
            e.target.style.transform = 'rotate(90deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'rotate(0deg) scale(1)';
          }}>✕</button>
        </div>

        {/* 리뷰 작성 폼 */}
        <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px' }}>리뷰 작성</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              평점: {rating.toFixed(1)}점
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                const fillPercentage = rating >= starValue ? 100 : rating > i ? (rating - i) * 100 : 0;
                return (
                  <div key={i} style={{ position: 'relative', fontSize: '24px', lineHeight: 1 }}>
                    <span style={{ color: '#ddd' }}>⭐</span>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      overflow: 'hidden',
                      width: `${fillPercentage}%`,
                      color: '#ffd700'
                    }}>⭐</span>
                  </div>
                );
              })}
              <span style={{ fontWeight: '600', color: '#667eea', fontSize: '18px' }}>{rating.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${rating * 20}%, #ddd ${rating * 20}%, #ddd 100%)`,
                cursor: 'pointer',
                WebkitAppearance: 'none'
              }}
            />
            <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              }
              input[type='range']::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              }
            `}</style>
          </div>
          <input
            type="text"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            placeholder="리뷰 제목"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(219, 219, 219, 0.6)',
              marginBottom: '12px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: 'rgba(250, 250, 250, 0.8)',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(219, 219, 219, 0.6)';
              e.target.style.background = 'rgba(250, 250, 250, 0.8)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="리뷰 내용을 작성하세요..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(219, 219, 219, 0.6)',
              resize: 'vertical',
              marginBottom: '12px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: 'rgba(250, 250, 250, 0.8)',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              lineHeight: '1.6'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(219, 219, 219, 0.6)';
              e.target.style.background = 'rgba(250, 250, 250, 0.8)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button type="submit" style={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}>리뷰 등록</button>
        </form>

        {/* 리뷰 목록 */}
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>리뷰 ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>아직 리뷰가 없습니다.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.review_id} style={{
                padding: '16px',
                background: selectedReviewId === review.review_id ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.4)',
                borderRadius: '12px',
                marginBottom: '12px',
                border: selectedReviewId === review.review_id ? '2px solid #667eea' : '2px solid rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => handleReviewClick(review.review_id)}>
                      <span style={{ fontWeight: '600' }}>{review.user_name || '익명'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>{'⭐'.repeat(review.rating)}</span>
                      {review.user_id === parseInt(userId) && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingReview({...review});
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '4px'
                            }}
                          >✏️</button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReview(review.review_id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '4px'
                            }}
                          >🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ cursor: 'pointer' }} onClick={() => handleReviewClick(review.review_id)}>
                    <p style={{ margin: '8px 0', color: '#333' }}>{review.content}</p>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* 댓글 섹션 */}
                {selectedReviewId === review.review_id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.5)' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>댓글 ({comments.length})</h4>
                    
                    {/* 댓글 목록 */}
                    {comments.map((comment) => (
                      <div key={comment.comment_id} style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>
                            {comment.user_name || '익명'}
                          </div>
                          {comment.user_id === parseInt(userId) && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => setEditingComment({...comment})}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '2px'
                                }}
                              >✏️</button>
                              <button
                                onClick={() => handleDeleteComment(comment.comment_id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '2px'
                                }}
                              >🗑️</button>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#333' }}>{comment.content}</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}

                    {/* 댓글 작성 폼 */}
                    <form onSubmit={handleCommentSubmit} style={{ marginTop: '12px' }}>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(219, 219, 219, 0.6)',
                          marginBottom: '8px',
                          boxSizing: 'border-box',
                          background: 'rgba(250, 250, 250, 0.8)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '13px',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(219, 219, 219, 0.6)';
                          e.target.style.background = 'rgba(250, 250, 250, 0.8)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button type="submit" style={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                      }}>댓글 작성</button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {editingReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          backdropFilter: 'blur(8px)'
        }} onClick={() => setEditingReview(null)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '580px',
            width: '90%',
            boxShadow: '0 25px 80px rgba(102, 126, 234, 0.3)',
            border: '1px solid #e0e0e0',
            animation: 'modalSlideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            <style>{`
              @keyframes modalSlideIn {
                from {
                  opacity: 0;
                  transform: translateY(-20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}>✏️</div>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#333' }}>리뷰 수정</h3>
              </div>
              <button onClick={() => setEditingReview(null)} style={{
                background: '#f8f9fa',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                padding: '8px',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e9ecef';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.transform = 'rotate(0deg)';
              }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: '#444', fontSize: '15px' }}>
                <span style={{ fontSize: '18px' }}>📝</span>
                제목
              </label>
              <input
                value={editingReview.title}
                onChange={(e) => setEditingReview({...editingReview, title: e.target.value})}
                placeholder="리뷰 제목을 입력하세요"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'all 0.3s',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  background: 'white',
                  color: '#333'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: '#444', fontSize: '15px' }}>
                <span style={{ fontSize: '18px' }}>⭐</span>
                평점
              </label>
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%)', borderRadius: '12px', border: '2px solid #ffe066' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const fillPercentage = editingReview.rating >= starValue ? 100 : editingReview.rating > i ? (editingReview.rating - i) * 100 : 0;
                      return (
                        <div key={i} style={{ position: 'relative', fontSize: '24px', lineHeight: 1 }}>
                          <span style={{ color: '#ddd' }}>⭐</span>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            overflow: 'hidden',
                            width: `${fillPercentage}%`,
                            color: '#ffd700'
                          }}>⭐</span>
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#ff9800' }}>{editingReview.rating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({...editingReview, rating: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    outline: 'none',
                    background: `linear-gradient(to right, #ffd700 0%, #ffd700 ${editingReview.rating * 20}%, #ddd ${editingReview.rating * 20}%, #ddd 100%)`,
                    cursor: 'pointer',
                    WebkitAppearance: 'none'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: '#444', fontSize: '15px' }}>
                <span style={{ fontSize: '18px' }}>💬</span>
                내용
              </label>
              <textarea
                value={editingReview.content}
                onChange={(e) => setEditingReview({...editingReview, content: e.target.value})}
                placeholder="리뷰 내용을 입력하세요"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '15px',
                  minHeight: '140px',
                  resize: 'vertical',
                  transition: 'all 0.3s',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.7',
                  boxSizing: 'border-box',
                  background: 'white',
                  color: '#333'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                onClick={() => setEditingReview(null)}
                style={{
                  padding: '14px 28px',
                  background: 'white',
                  color: '#666',
                  border: '2px solid #e8e8e8',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#d0d0d0';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e8e8e8';
                  e.target.style.transform = 'translateY(0)';
                }}
              >취소</button>
              <button
                onClick={handleUpdateReview}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '15px',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
              >✔️ 저장하기</button>
            </div>
          </div>
        </div>
      )}

      {editingComment && (
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
          zIndex: 10001
        }} onClick={() => setEditingComment(null)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#333' }}>💬 댓글 수정</h3>
              <button onClick={() => setEditingComment(null)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: 0
              }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                내용
              </label>
              <textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
                placeholder="댓글 내용을 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  minHeight: '100px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingComment(null)}
                style={{
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
              >취소</button>
              <button
                onClick={handleUpdateComment}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaceModal;
