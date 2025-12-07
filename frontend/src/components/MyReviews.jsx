import React, { useState, useEffect } from 'react';
import { reviewAPI, commentAPI } from '../services/api';

function MyReviews({ onClose }) {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
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

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await reviewAPI.deleteReview(reviewId);
        setReviews(reviews.filter(r => r.review_id !== reviewId));
        alert('리뷰가 삭제되었습니다.');
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await commentAPI.deleteComment(commentId);
        setComments(comments.filter(c => c.comment_id !== commentId));
        alert('댓글이 삭제되었습니다.');
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const handleEditReview = async () => {
    try {
      await reviewAPI.updateReview(editingReview.review_id, {
        title: editingReview.title,
        content: editingReview.content,
        rating: parseFloat(editingReview.rating)
      });
      loadMyReviews();
      setEditingReview(null);
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const handleEditComment = async () => {
    try {
      await commentAPI.updateComment(editingComment.comment_id, editingComment.content);
      loadMyComments();
      setEditingComment(null);
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
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>⭐ 내 활동</h2>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px'
            }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === 'reviews' ? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                color: activeTab === 'reviews' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              📝 내 리뷰 ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === 'comments' ? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                color: activeTab === 'comments' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              💬 내 댓글 ({comments.length})
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {activeTab === 'reviews' ? (
            reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>작성한 리뷰가 없습니다.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.review_id} style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={(e) => {
                  if (!e.target.closest('button')) {
                    if (review.latitude && review.longitude) {
                      window.moveMapToLocation?.(review.latitude, review.longitude);
                    }
                    setSelectedReview(review);
                  }
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontWeight: '600', fontSize: '16px' }}>{review.title}</span>
                      <span style={{ color: '#ffc107', fontWeight: '600' }}>⭐ {review.rating}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingReview({...review});
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
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
                          fontSize: '18px',
                          padding: '4px'
                        }}
                      >🗑️</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    <span>📍 {review.place_name || '장소 정보 없음'}</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>작성한 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment_id} style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={async (e) => {
                  if (!e.target.closest('button')) {
                    if (comment.latitude && comment.longitude) {
                      window.moveMapToLocation?.(comment.latitude, comment.longitude);
                    }
                    setLoadingReview(true);
                    try {
                      const reviewData = await reviewAPI.getReviewById(comment.review_id);
                      setSelectedReview(reviewData);
                    } catch (error) {
                      console.error('리뷰 로드 실패:', error);
                    } finally {
                      setLoadingReview(false);
                    }
                  }
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <p style={{ margin: 0, color: '#333', fontSize: '14px', flex: 1 }}>{comment.content}</p>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingComment({...comment});
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '4px'
                        }}
                      >✏️</button>
                      <button
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '4px'
                        }}
                      >🗑️</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                    <span>📍 {comment.place_name || '장소 정보 없음'}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {selectedReview && (
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
        }} onClick={() => setSelectedReview(null)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{selectedReview.title}</h3>
              <button onClick={() => setSelectedReview(null)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}>✕</button>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#ffc107', fontWeight: '600', fontSize: '18px' }}>⭐ {selectedReview.rating}</span>
            </div>
            <p style={{ color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedReview.content}</p>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '12px', color: '#999' }}>
              <div>📍 {selectedReview.place_name || '장소 정보 없음'}</div>
              <div>{new Date(selectedReview.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {editingReview && (
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
          zIndex: 10002
        }} onClick={() => setEditingReview(null)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>리뷰 수정</h3>
            <input
              value={editingReview.title}
              onChange={(e) => setEditingReview({...editingReview, title: e.target.value})}
              placeholder="제목"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <textarea
              value={editingReview.content}
              onChange={(e) => setEditingReview({...editingReview, content: e.target.value})}
              placeholder="내용"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={editingReview.rating}
              onChange={(e) => setEditingReview({...editingReview, rating: e.target.value})}
              placeholder="평점 (0-5)"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingReview(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >취소</button>
              <button
                onClick={handleEditReview}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >저장</button>
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
          zIndex: 10002
        }} onClick={() => setEditingComment(null)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>댓글 수정</h3>
            <textarea
              value={editingComment.content}
              onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
              placeholder="댓글 내용"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingComment(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >취소</button>
              <button
                onClick={handleEditComment}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReviews;
