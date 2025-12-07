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
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>📍 {placeInfo.name}</h2>
            {placeInfo.rating !== null && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                평균 평점: ⭐ {placeInfo.rating?.toFixed(1)}
              </div>
            )}
          </div>
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

        {/* 리뷰 작성 폼 */}
        <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px' }}>리뷰 작성</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              평점: {'⭐'.repeat(Math.floor(rating))}{rating % 1 >= 0.5 ? '⭐' : ''} ({rating}점)
            </label>
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
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              marginBottom: '12px',
              fontFamily: 'inherit'
            }}
          />
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="리뷰 내용을 작성하세요..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              resize: 'vertical',
              marginBottom: '12px',
              fontFamily: 'inherit'
            }}
          />
          <button type="submit" style={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
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
                background: '#f8f9fa',
                borderRadius: '12px',
                marginBottom: '12px',
                border: selectedReviewId === review.review_id ? '2px solid #667eea' : '2px solid transparent'
              }}>
                <div style={{ cursor: 'pointer' }} onClick={() => handleReviewClick(review.review_id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{review.user_name || '익명'}</span>
                    <span>{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p style={{ margin: '8px 0', color: '#333' }}>{review.content}</p>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* 댓글 섹션 */}
                {selectedReviewId === review.review_id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>댓글 ({comments.length})</h4>
                    
                    {/* 댓글 목록 */}
                    {comments.map((comment) => (
                      <div key={comment.comment_id} style={{
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                          {comment.user_name || '익명'}
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
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          marginBottom: '8px'
                        }}
                      />
                      <button type="submit" style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '6px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}>댓글 작성</button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceModal;
