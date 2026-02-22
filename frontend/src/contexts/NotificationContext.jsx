import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socketService.js';
import { useAuth } from './AuthContext.jsx';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Keep only last 50
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification =>
          notification.id !== action.payload
        ),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n.id === action.payload && !n.isRead) ? 1 : 0
        ),
      };
    default:
      return state;
  }
};

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Setup socket listeners
    const handleNotification = (data) => {
      const notification = {
        id: Date.now() + Math.random(), // Simple ID generation
        title: data.title || 'New Notification',
        message: data.message,
        type: data.type || 'info',
        timestamp: data.timestamp || new Date().toISOString(),
        isRead: false,
        data: data.data || {},
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    };

    const handleBookingUpdate = (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        title: 'Booking Update',
        message: data.message,
        type: 'booking',
        timestamp: data.timestamp,
        isRead: false,
        data,
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    };

    const handleWellnessUpdate = (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        title: 'Wellness Update',
        message: data.message || 'New wellness check-in received',
        type: 'wellness',
        timestamp: data.timestamp,
        isRead: false,
        data,
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    };

    // Register socket listeners
    socketService.on('notification', handleNotification);
    socketService.on('booking_update', handleBookingUpdate);
    socketService.on('wellness_update', handleWellnessUpdate);

    // Check connection status
    const checkConnection = () => {
      dispatch({ type: 'SET_CONNECTED', payload: socketService.isConnectedToServer() });
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    // Cleanup
    return () => {
      clearInterval(connectionInterval);
      socketService.off('notification', handleNotification);
      socketService.off('booking_update', handleBookingUpdate);
      socketService.off('wellness_update', handleWellnessUpdate);
    };
  }, [isAuthenticated, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  // Send test notification (for development)
  const sendTestNotification = () => {
    if (user) {
      const testNotification = {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        type: 'system',
        timestamp: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        ...testNotification,
        id: Date.now(),
        isRead: false,
        data: {},
      }});
    }
  };

  const value = {
    ...state,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};