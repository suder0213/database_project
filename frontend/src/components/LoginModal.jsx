import React, { useState } from 'react';
import { saveAuthData } from '../utils/auth';
import { authAPI } from '../services/api';

function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginForm.id || !loginForm.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login(loginForm.id, loginForm.password);
      
      if (response.user_id) {
        saveAuthData({
          user_id: response.user_id,
          id: loginForm.id,
          name: response.name || loginForm.id
        });
        onLogin({ user_id: response.user_id, id: loginForm.id, name: response.name });
        setLoginForm({ id: '', password: '' });
      } else {
        setError(response.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('올바른 아이디와 비밀번호를 입력하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.register({
        id: registerForm.id,
        password: registerForm.password,
        name: registerForm.name,
        email: registerForm.email
      });
      
      if (response.success) {
        setError('');
        setIsRegisterMode(false);
        setRegisterForm({ id: '', password: '', confirmPassword: '', name: '', email: '' });
        setError('✅ 회원가입이 완료되었습니다! 로그인해주세요.');
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
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
        animation: 'modalFadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              backdrop-filter: blur(0px);
            }
            to {
              opacity: 1;
              backdrop-filter: blur(5px);
            }
          }
          
          @keyframes modalBounce {
            0% {
              opacity: 0;
              transform: translateY(-100px) scale(0.3) rotate(-10deg);
            }
            50% {
              opacity: 1;
              transform: translateY(10px) scale(1.1) rotate(2deg);
            }
            70% {
              transform: translateY(-5px) scale(0.95) rotate(-1deg);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1) rotate(0deg);
            }
          }
          
          @keyframes iconBounce {
            0% { transform: scale(1) translateY(0) rotate(0deg); }
            15% { transform: scale(1.1) translateY(-5px) rotate(3deg); }
            30% { transform: scale(0.95) translateY(2px) rotate(-2deg); }
            45% { transform: scale(1.05) translateY(-3px) rotate(1deg); }
            60% { transform: scale(0.98) translateY(1px) rotate(-1deg); }
            75% { transform: scale(1.02) translateY(-1px) rotate(0.5deg); }
            90% { transform: scale(0.99) translateY(0.5px) rotate(-0.5deg); }
            100% { transform: scale(1) translateY(0) rotate(0deg); }
          }
          
          @keyframes inputGlow {
            0% { box-shadow: 0 0 5px rgba(0, 149, 246, 0.3); }
            50% { box-shadow: 0 0 20px rgba(0, 149, 246, 0.6); }
            100% { box-shadow: 0 0 5px rgba(0, 149, 246, 0.3); }
          }
          
          @keyframes buttonPulse {
            0% { transform: translateY(-2px) scale(1.02); }
            50% { transform: translateY(-4px) scale(1.05); }
            100% { transform: translateY(-2px) scale(1.02); }
          }
          
          @keyframes testAccountFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0px); }
          }
          
          .modal-title {
            color: #ffffff;
            text-shadow: 2px 2px 0px #f09433, 4px 4px 0px #e6683c, 6px 6px 0px #dc2743;
            font-weight: 900;
            letter-spacing: 1px;
            transform: perspective(500px) rotateX(15deg);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .modal-title:hover {
            transform: perspective(500px) rotateX(15deg) scale(1.1);
            text-shadow: 3px 3px 0px #f09433, 6px 6px 0px #e6683c, 9px 9px 0px #dc2743;
          }
          
          .modal-subtitle {
            color: #f0f0f0;
            font-style: italic;
            text-shadow: 1px 1px 2px rgba(240, 148, 51, 0.3);
            font-weight: 400;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-size: 13px !important;
          }
          
          .modal-container {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .modal-container:hover {
            transform: scale(1.03) !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(240, 148, 51, 0.3) 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.6) !important;
          }
          
          .modal-logo {
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            background-size: 200% 200%;
          }
          
          .modal-logo:hover {
            animation: iconBounce 1.2s ease-out infinite;
            box-shadow: 0 15px 40px rgba(240, 148, 51, 0.6), 0 0 20px rgba(240, 148, 51, 0.3);
            background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%, #f09433 125%);
            background-size: 300% 300%;
            transform: scale(1.05);
          }
          
          .modal-logo svg {
            transition: all 0.3s ease;
          }
          
          .modal-logo:hover svg {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
          }
          
          .modal-input {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .modal-input:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 8px 25px rgba(0, 149, 246, 0.25);
            background-color: #ffffff !important;
          }
          
          .modal-input:focus {
            transform: translateY(-3px) scale(1.02);
            animation: inputGlow 2s ease-in-out infinite;
            background-color: #ffffff !important;
          }
          
          .modal-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background-size: 300% 300%;
            position: relative;
            overflow: hidden;
          }
          
          .modal-button:hover {
            animation: buttonPulse 1s ease-in-out infinite;
            box-shadow: 0 15px 35px rgba(240, 148, 51, 0.5);
            background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%, #f09433 125%);
            background-size: 400% 400%;
          }
          
          .modal-button:active {
            transform: translateY(0) scale(0.95);
            animation: none;
          }
          
          .test-account {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .test-account:hover {
            animation: testAccountFloat 1s ease-in-out infinite;
            background-color: #e1f5fe !important;
            box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
            border-color: #90caf9 !important;
            transform: scale(1.05);
          }
        `}
      </style>
      <div 
        className="modal-container"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(240, 148, 51, 0.2) 100%)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          padding: '40px',
          width: '400px',
          maxWidth: '90vw',
          animation: 'modalBounce 0.5s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>

        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1
        }}>
          <div 
            className="modal-logo"
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              borderRadius: '16px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              cursor: 'pointer'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="white"/>
                <path d="M21 10C21 16 12 22 12 22S3 16 3 10C3 5.02 7.02 1 12 1S21 5.02 21 10Z" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" fill="rgba(240, 148, 51, 0.8)"/>
              </svg>
            </div>
          <h2 className="modal-title" style={{
            margin: 0,
            fontSize: '26px',
            marginBottom: '8px'
          }}>StoryMap 시작하기</h2>
          <p className="modal-subtitle" style={{
            margin: 0,
            fontSize: '15px'
          }}>지도에서 나만의 스토리를 공유해보세요</p>
        </div>
        
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: error.includes('✅') ? '#d4edda' : '#f8d7da',
            color: error.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '8px',
            fontSize: '13px',
            border: `1px solid ${error.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
          {!isRegisterMode ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="아이디"
                  value={loginForm.id}
                  onChange={(e) => setLoginForm({...loginForm, id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <input
                  className="modal-input"
                  type="password"
                  placeholder="비밀번호"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '12px' }}>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="아이디"
                  value={registerForm.id}
                  onChange={(e) => setRegisterForm({...registerForm, id: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  className="modal-input"
                  type="password"
                  placeholder="비밀번호"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  className="modal-input"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="이름"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  className="modal-input"
                  type="email"
                  placeholder="이메일"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: '#fafafa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0095f6'}
                  onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                />
              </div>
            </>
          )}
          
          <button
            className="modal-button"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              outline: 'none',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (isRegisterMode ? '가입 중...' : '로그인 중...') : (isRegisterMode ? '회원가입' : '로그인')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsRegisterMode(!isRegisterMode);
              setLoginForm({ id: '', password: '' });
              setRegisterForm({ id: '', password: '', confirmPassword: '', name: '', email: '' });
            }}
            style={{
              background: 'linear-gradient(45deg, rgba(240, 148, 51, 0.3), rgba(230, 104, 60, 0.3), rgba(220, 39, 67, 0.3), rgba(204, 35, 102, 0.3), rgba(188, 24, 136, 0.3))',
              border: '1px solid rgba(240, 148, 51, 0.5)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(240, 148, 51, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(45deg, rgba(240, 148, 51, 0.5), rgba(230, 104, 60, 0.5), rgba(220, 39, 67, 0.5), rgba(204, 35, 102, 0.5), rgba(188, 24, 136, 0.5))';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(240, 148, 51, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(45deg, rgba(240, 148, 51, 0.3), rgba(230, 104, 60, 0.3), rgba(220, 39, 67, 0.3), rgba(204, 35, 102, 0.3), rgba(188, 24, 136, 0.3))';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(240, 148, 51, 0.2)';
            }}
          >
            {isRegisterMode ? '← 로그인으로 돌아가기' : '✨ 회원가입하기'}
          </button>
        </div>
        

      </div>
    </div>
  );
}

export default LoginModal;