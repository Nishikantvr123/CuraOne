import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    sendTestNotification,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'wellness':
        return '🧘';
      case 'system':
        return '⚙️';
      case 'error':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'booking':
        return 'notification-booking';
      case 'wellness':
        return 'notification-wellness';
      case 'system':
        return 'notification-system';
      case 'error':
        return 'notification-error';
      case 'success':
        return 'notification-success';
      default:
        return 'notification-default';
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <div className="notification-title">
              <h3>Notifications</h3>
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="notification-actions">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      className="action-button mark-all-read"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="action-button clear-all"
                    onClick={clearNotifications}
                    title="Clear all notifications"
                  >
                    🗑️
                  </button>
                </>
              )}
              <button
                className="action-button test-notification"
                onClick={sendTestNotification}
                title="Send test notification"
              >
                🧪
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">🔕</span>
                <p>No notifications yet</p>
                <small>You'll see your latest updates here</small>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : 'read'} ${getNotificationTypeClass(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-text">
                      {notification.title}
                      {!notification.isRead && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  <button
                    className="notification-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    title="Remove notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <small>Showing latest {notifications.length > 50 ? 50 : notifications.length} notifications</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;