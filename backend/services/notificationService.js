import { create, find, update } from '../config/database.js';
import { validateNotification } from '../utils/validation.js';

// Send notification to user
export const sendNotification = async (notificationData) => {
  try {
    // Validate notification data
    const validation = validateNotification(notificationData);
    if (!validation.isValid) {
      throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
    }

    // Create notification record
    const notification = create('notifications', {
      recipientId: notificationData.recipientId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'system',
      priority: notificationData.priority || 'normal',
      data: notificationData.data || {},
      isRead: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
      readAt: null,
      deliveredAt: null
    });

    // Simulate sending notification (in real app, would integrate with email, SMS, push services)
    await simulateNotificationDelivery(notification);

    // Mark as delivered
    update('notifications', notification.id, {
      isDelivered: true,
      deliveredAt: new Date().toISOString()
    });

    console.log(`📧 Notification sent to user ${notificationData.recipientId}: ${notificationData.title}`);

    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    throw error;
  }
};

// Send bulk notifications
export const sendBulkNotifications = async (recipientIds, notificationData) => {
  const results = [];

  for (const recipientId of recipientIds) {
    try {
      const notification = await sendNotification({
        ...notificationData,
        recipientId
      });
      results.push({ recipientId, status: 'success', notification });
    } catch (error) {
      results.push({ recipientId, status: 'error', error: error.message });
    }
  }

  return results;
};

// Get notifications for user
export const getUserNotifications = (userId, options = {}) => {
  const { 
    limit = 20, 
    page = 1, 
    unreadOnly = false, 
    type = null 
  } = options;

  let query = { recipientId: userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }

  const allNotifications = find('notifications', query)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const notifications = allNotifications.slice(startIndex, endIndex);

  return {
    notifications,
    pagination: {
      total: allNotifications.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(allNotifications.length / limit),
      unreadCount: find('notifications', { recipientId: userId, isRead: false }).length
    }
  };
};

// Mark notification as read
export const markAsRead = (notificationId, userId) => {
  const notification = find('notifications', { 
    id: notificationId, 
    recipientId: userId 
  })[0];

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (!notification.isRead) {
    return update('notifications', notificationId, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }

  return notification;
};

// Mark all notifications as read for user
export const markAllAsRead = (userId) => {
  const unreadNotifications = find('notifications', { 
    recipientId: userId, 
    isRead: false 
  });

  const results = [];
  const readAt = new Date().toISOString();

  for (const notification of unreadNotifications) {
    const updated = update('notifications', notification.id, {
      isRead: true,
      readAt
    });
    results.push(updated);
  }

  return results;
};

// Delete notification
export const deleteNotification = (notificationId, userId) => {
  const notification = find('notifications', { 
    id: notificationId, 
    recipientId: userId 
  })[0];

  if (!notification) {
    throw new Error('Notification not found');
  }

  // In a real database, we would actually delete
  // For our JSON store, we'll mark as deleted
  return update('notifications', notificationId, {
    isDeleted: true,
    deletedAt: new Date().toISOString()
  });
};

// Send appointment reminder
export const sendAppointmentReminder = async (booking) => {
  const reminderData = {
    recipientId: booking.patientId,
    title: 'Appointment Reminder',
    message: `Don't forget your ${booking.therapy.name} session tomorrow at ${booking.scheduledTime}`,
    type: 'reminder',
    priority: 'normal',
    data: {
      bookingId: booking.id,
      therapyName: booking.therapy.name,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime
    }
  };

  return await sendNotification(reminderData);
};

// Send wellness check-in reminder
export const sendWellnessReminder = async (userId) => {
  const reminderData = {
    recipientId: userId,
    title: 'Wellness Check-in Reminder',
    message: 'Time to update your daily wellness metrics!',
    type: 'wellness',
    priority: 'low',
    data: {
      action: 'wellness-checkin'
    }
  };

  return await sendNotification(reminderData);
};

// Send system notification
export const sendSystemNotification = async (userId, title, message, data = {}) => {
  return await sendNotification({
    recipientId: userId,
    title,
    message,
    type: 'system',
    priority: 'normal',
    data
  });
};

// Simulate notification delivery (placeholder for real integrations)
const simulateNotificationDelivery = async (notification) => {
  // In a real app, this would:
  // 1. Send email via SendGrid/Nodemailer
  // 2. Send SMS via Twilio
  // 3. Send push notification via Firebase/OneSignal
  // 4. Send in-app notification via WebSocket

  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Log the notification for debugging
  console.log(`📱 [${notification.type.toUpperCase()}] ${notification.title}`);
  console.log(`   To: User ${notification.recipientId}`);
  console.log(`   Message: ${notification.message}`);
  
  return true;
};

// Schedule notifications (placeholder for cron jobs)
export const scheduleNotifications = () => {
  // In a real app, this would set up cron jobs or use a job queue
  console.log('📅 Notification scheduling service started');
  
  // Example: Check for appointment reminders every hour
  setInterval(() => {
    // checkAppointmentReminders();
  }, 60 * 60 * 1000); // 1 hour

  // Example: Send daily wellness reminders
  setInterval(() => {
    // sendDailyWellnessReminders();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

// Get notification statistics for admin
export const getNotificationStats = () => {
  const allNotifications = find('notifications', {});
  
  const stats = {
    total: allNotifications.length,
    delivered: allNotifications.filter(n => n.isDelivered).length,
    read: allNotifications.filter(n => n.isRead).length,
    unread: allNotifications.filter(n => !n.isRead).length,
    byType: {},
    byPriority: {}
  };

  // Group by type
  allNotifications.forEach(notification => {
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
  });

  return stats;
};