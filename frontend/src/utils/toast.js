// Simple toast utility for showing user notifications
let toastContainer = null;

const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const createToast = (message, type = 'info', duration = 3000) => {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    pointer-events: auto;
    min-width: 300px;
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  // Set background color based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  
  // Add icon based on type
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const icon = document.createElement('span');
  icon.textContent = icons[type] || icons.info;
  icon.style.marginRight = '8px';
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin-left: auto;
    cursor: pointer;
    padding: 0 0 0 12px;
  `;
  
  toast.appendChild(icon);
  toast.appendChild(messageSpan);
  toast.appendChild(closeButton);
  
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto remove after duration
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, duration);
  
  // Close button functionality
  closeButton.addEventListener('click', () => {
    clearTimeout(timeoutId);
    removeToast(toast);
  });
  
  return toast;
};

const removeToast = (toast) => {
  toast.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
};

export const toast = {
  success: (message, duration) => createToast(message, 'success', duration),
  error: (message, duration) => createToast(message, 'error', duration),
  warning: (message, duration) => createToast(message, 'warning', duration),
  info: (message, duration) => createToast(message, 'info', duration)
};

export default toast;