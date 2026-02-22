import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
import toast from '../utils/toast';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [realtimeBookings, setRealtimeBookings] = useState([]);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online');

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔗 Initializing real-time connection for user:', user.id);
      const socket = socketService.connect(user.id);
      
      // Set connection status
      const handleConnect = () => {
        setIsConnected(true);
        setSystemStatus('online');
        toast.success('Connected to real-time updates', 2000);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setSystemStatus('offline');
        toast.warning('Disconnected from real-time updates', 3000);
      };

      const handleConnectError = () => {
        setIsConnected(false);
        setSystemStatus('error');
        toast.error('Failed to connect to real-time updates', 3000);
      };

      // Setup socket event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
      };
    } else {
      // Disconnect when user logs out
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.id]);

  // Real-time notification handler
  const handleRealtimeNotification = useCallback((notification) => {
    console.log('🔔 Real-time notification received:', notification);
    
    setRealtimeNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    
    // Show toast based on notification type
    switch (notification.type) {
      case 'booking':
        toast.info(`📅 ${notification.message}`, 4000);
        break;
      case 'wellness':
        toast.info(`❤️ ${notification.message}`, 4000);
        break;
      case 'appointment':
        toast.warning(`🕐 ${notification.message}`, 5000);
        break;
      case 'system':
        toast.info(`ℹ️ ${notification.message}`, 3000);
        break;
      default:
        toast.info(notification.message, 3000);
    }
  }, []);

  // Real-time booking update handler
  const handleBookingUpdate = useCallback((bookingData) => {
    console.log('📅 Real-time booking update:', bookingData);
    
    setRealtimeBookings(prev => {
      const existingIndex = prev.findIndex(b => b.id === bookingData.id);
      if (existingIndex >= 0) {
        // Update existing booking
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...bookingData };
        return updated;
      } else {
        // Add new booking
        return [bookingData, ...prev];
      }
    });

    // Trigger notification based on booking status
    const statusMessages = {
      confirmed: `Your appointment has been confirmed for ${bookingData.scheduledDate}`,
      cancelled: `Your appointment for ${bookingData.scheduledDate} has been cancelled`,
      rescheduled: `Your appointment has been rescheduled`,
      reminder: `Reminder: Your appointment is coming up soon`
    };

    if (statusMessages[bookingData.status]) {
      handleRealtimeNotification({
        id: `booking_${bookingData.id}_${Date.now()}`,
        type: 'booking',
        message: statusMessages[bookingData.status],
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal'
      });
    }
  }, [handleRealtimeNotification]);

  // Real-time wellness update handler
  const handleWellnessUpdate = useCallback((wellnessData) => {
    console.log('❤️ Real-time wellness update:', wellnessData);
    
    // For practitioners - notify about patient wellness updates
    if (user?.role === 'practitioner') {
      handleRealtimeNotification({
        id: `wellness_${Date.now()}`,
        type: 'wellness',
        message: wellnessData.message || `${wellnessData.patientName} has updated their wellness check-in`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal'
      });
    }
  }, [user?.role, handleRealtimeNotification]);

  // Setup real-time event listeners
  useEffect(() => {
    if (isConnected) {
      socketService.on('notification', handleRealtimeNotification);
      socketService.on('booking_update', handleBookingUpdate);
      socketService.on('wellness_update', handleWellnessUpdate);

      return () => {
        socketService.off('notification', handleRealtimeNotification);
        socketService.off('booking_update', handleBookingUpdate);
        socketService.off('wellness_update', handleWellnessUpdate);
      };
    }
  }, [isConnected, handleRealtimeNotification, handleBookingUpdate, handleWellnessUpdate]);

  // Send real-time booking update
  const sendBookingUpdate = useCallback((booking, action = 'updated') => {
    if (isConnected && booking) {
      const message = `Booking ${action}: ${booking.therapy?.name || 'Session'} on ${booking.scheduledDate}`;
      socketService.sendBookingUpdate(booking.patient?.id || user?.id, message);
      
      console.log('📤 Sent booking update:', { booking, action });
    }
  }, [isConnected, user?.id]);

  // Send real-time wellness update  
  const sendWellnessUpdate = useCallback((wellnessData) => {
    if (isConnected && wellnessData && user) {
      // Find practitioner ID from user data or booking history
      const practitionerId = wellnessData.practitionerId || 'practitioner-1'; // Fallback
      const patientName = user.name || `${user.firstName} ${user.lastName}`;
      
      socketService.sendWellnessUpdate(practitionerId, patientName);
      
      console.log('📤 Sent wellness update:', { wellnessData, practitionerId, patientName });
    }
  }, [isConnected, user]);

  // Send custom notification
  const sendNotification = useCallback((notification) => {
    if (isConnected) {
      handleRealtimeNotification({
        id: `custom_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        ...notification
      });
    }
  }, [isConnected, handleRealtimeNotification]);

  // Clear old notifications
  const clearNotifications = useCallback(() => {
    setRealtimeNotifications([]);
  }, []);

  // Join/leave rooms for specific features
  const joinRoom = useCallback((roomName) => {
    if (isConnected) {
      socketService.joinRoom(roomName);
      console.log(`🏠 Joined room: ${roomName}`);
    }
  }, [isConnected]);

  const leaveRoom = useCallback((roomName) => {
    if (isConnected) {
      socketService.leaveRoom(roomName);
      console.log(`🚪 Left room: ${roomName}`);
    }
  }, [isConnected]);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      socketId: socketService.getSocketId(),
      systemStatus,
      onlineUsers: onlineUsers.length,
      lastConnected: isConnected ? new Date() : null
    };
  }, [isConnected, systemStatus, onlineUsers.length]);

  // Simulate some real-time events for demo purposes
  const simulateRealtimeEvent = useCallback((type = 'notification') => {
    if (!isConnected) return;

    const demoEvents = {
      notification: {
        type: 'system',
        message: 'This is a demo real-time notification',
        priority: 'normal'
      },
      booking: {
        id: `demo_${Date.now()}`,
        therapy: { name: 'Demo Therapy' },
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '14:00',
        status: 'confirmed',
        patient: { name: user?.name || 'Demo User' }
      },
      wellness: {
        patientName: user?.name || 'Demo User',
        message: 'Demo wellness check-in completed'
      }
    };

    const event = demoEvents[type];
    if (event) {
      switch (type) {
        case 'notification':
          handleRealtimeNotification({
            id: `demo_${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...event
          });
          break;
        case 'booking':
          handleBookingUpdate(event);
          break;
        case 'wellness':
          handleWellnessUpdate(event);
          break;
      }
    }
  }, [isConnected, user?.name, handleRealtimeNotification, handleBookingUpdate, handleWellnessUpdate]);

  const value = {
    // Connection state
    isConnected,
    systemStatus,
    onlineUsers,
    
    // Real-time data
    realtimeBookings,
    realtimeNotifications,
    
    // Actions
    sendBookingUpdate,
    sendWellnessUpdate,
    sendNotification,
    clearNotifications,
    
    // Room management
    joinRoom,
    leaveRoom,
    
    // Utilities
    getConnectionInfo,
    simulateRealtimeEvent
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;