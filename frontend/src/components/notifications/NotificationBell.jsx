import React, { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, Calendar, Heart, MessageCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock notification data structure to match context expectations
const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
      return Calendar;
    case 'wellness':
      return Heart;
    case 'system':
      return Info;
    default:
      return Bell;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'booking':
      return { color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'wellness':
      return { color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    case 'system':
      return { color: 'text-purple-600', bgColor: 'bg-purple-50' };
    default:
      return { color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

// Individual Notification Component
const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const Icon = getNotificationIcon(notification.type);
  const { color, bgColor } = getNotificationColor(notification.type);

  return (
    <div className={cn(
      "flex items-start p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
      notification.isRead ? "bg-white border-gray-200" : "border-l-4 shadow-sm bg-blue-50 border-l-blue-500"
    )}>
      <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      
      <div className="ml-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-medium",
              notification.isRead ? "text-gray-700" : "text-gray-900"
            )}>
              {notification.title}
            </h4>
            <p className={cn(
              "text-sm mt-1",
              notification.isRead ? "text-gray-500" : "text-gray-700"
            )}>
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center ml-2 space-x-1">
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Mark as read"
              >
                <Check className="h-4 w-4 text-emerald-600" />
              </button>
            )}
            <button
              onClick={() => onRemove(notification.id)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Remove notification"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Notification Bell Component
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <div className="p-2 space-y-2">
                  {recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onRemove={removeNotification}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;