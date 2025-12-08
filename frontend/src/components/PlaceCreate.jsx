import React, { useState } from 'react';
import { placeAPI } from '../services/api';

function PlaceCreate({ onClose, onSuccess, latitude, longitude }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await placeAPI.createPlace({
        name,
        latitude,
        longitude
      });

      if (response.success) {
        onSuccess && onSuccess(response.place_id);
        onClose();
      }
    } catch (error) {
      console.error('Place creation error:', error);
      alert('장소 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 245, 255, 0.95) 100%)',
        borderRadius: '24px',
        padding: '30px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '700' }}>📍 장소 생성</h2>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              장소 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 스타벅스 강남점"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                boxSizing: 'border-box',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 123, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 123, 255, 0.2)' }}>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
              <div>📍 위치: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px',
                background: isLoading ? '#ccc' : 'linear-gradient(45deg, #007bff 0%, #0056b3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
              }}
            >
              {isLoading ? '생성 중...' : '✔ 생성하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlaceCreate;
