// Toast 알림 시스템
let toastContainer = null;

const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
  warning: (message) => showToast(message, 'warning')
};

const showToast = (message, type = 'info') => {
  const container = createToastContainer();
  
  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    min-width: 250px;
    max-width: 400px;
    backdrop-filter: blur(10px);
  `;

  const colors = {
    success: 'linear-gradient(135deg, #28a745, #20c997)',
    error: 'linear-gradient(135deg, #dc3545, #c82333)',
    info: 'linear-gradient(135deg, #17a2b8, #138496)',
    warning: 'linear-gradient(135deg, #ffc107, #e0a800)'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  toastEl.style.background = colors[type];
  toastEl.innerHTML = `${icons[type]} ${message}`;

  container.appendChild(toastEl);

  // 애니메이션 스타일 추가
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 3초 후 제거
  setTimeout(() => {
    toastEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      container.removeChild(toastEl);
      if (container.children.length === 0) {
        document.body.removeChild(container);
        toastContainer = null;
      }
    }, 300);
  }, 3000);
};

export default toast;
