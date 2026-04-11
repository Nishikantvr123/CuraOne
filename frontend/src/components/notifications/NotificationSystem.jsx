import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Calendar, 
  Heart,
  Clock,
  MessageCircle
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Session Reminder',
    message: 'Your Abhyanga session is scheduled for today at 10:00 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    priority: 'high',
    actionUrl: '/sessions',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Daily Wellness Check-in',
    message: 'Don\'t forget to log your daily wellness metrics',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    priority: 'medium',
    actionUrl: '/wellness',
    icon: Heart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: '3',
    type: 'alert',
    title: 'Session Feedback Pending',
    message: 'Please provide feedback for your last Shirodhara session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: true,
    priority: 'medium',
    actionUrl: '/feedback',
    icon: MessageCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: '4',
    type: 'update',
    title: 'Treatment Plan Updated',
    message: 'Dr. Sarah Smith has updated your treatment plan. Review the changes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    priority: 'low',
    actionUrl: '/treatment-plan',
    icon: Info,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Session Confirmation Required',
    message: 'Please confirm your Panchakarma session scheduled for Oct 20',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: false,
    priority: 'high',
    actionUrl: '/sessions/confirm',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
];

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

// Individual Notification Component
const NotificationItem = ({ notification, onMarkAsRead, onRemove, onAction }) => {
  const { icon: Icon, color, bgColor } = notification;

  return (
    <div className={cn(
      "flex items-start p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
      notification.read ? "bg-white border-gray-200" : "border-l-4 shadow-sm",
      !notification.read && notification.priority === 'high' && "border-l-red-500 bg-red-50",
      !notification.read && notification.priority === 'medium' && "border-l-blue-500 bg-blue-50",
      !notification.read && notification.priority === 'low' && "border-l-gray-500 bg-gray-50"
    )}>
      <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      
      <div className="ml-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-medium",
              notification.read ? "text-gray-700" : "text-gray-900"
            )}>
              {notification.title}
            </h4>
            <p className={cn(
              "text-sm mt-1",
              notification.read ? "text-gray-500" : "text-gray-700"
            )}>
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </span>
              {notification.priority === 'high' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  High Priority
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center ml-2 space-x-1">
            {!notification.read && (
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
        
        {notification.actionUrl && (
          <button 
            onClick={() => onAction(notification.actionUrl)}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Take Action →
          </button>
        )}
      </div>
    </div>
  );
};

// Main Notification Bell Component
export const NotificationBell = () => {
  const { 
    notifications, 
    isOpen, 
    setIsOpen, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    unreadCount 
  } = useNotifications();

  const handleAction = (actionUrl) => {
    // In a real app, this would navigate to the appropriate page
    console.log(`Navigating to: ${actionUrl}`);
    setIsOpen(false);
  };

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
                      onAction={handleAction}
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

// In-App Toast Notifications
export const ToastNotification = ({ notification, onClose }) => {
  const { icon: Icon, color, bgColor } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 overflow-hidden transform transition-all duration-300",
      notification.priority === 'high' && "border-l-red-500",
      notification.priority === 'medium' && "border-l-blue-500",
      notification.priority === 'low' && "border-l-gray-500"
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn("flex-shrink-0 p-1 rounded-full", bgColor)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {notification.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};