import { create, find, update } from '../config/database.js';
import { validateNotification } from '../utils/validation.js';

export const sendNotification = async (notificationData) => {
  try {
    const validation = validateNotification(notificationData);
    if (!validation.isValid) {
      throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
    }

    const notification = await create('notifications', {
      recipientId: notificationData.recipientId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'system',
      priority: notificationData.priority || 'normal',
      data: notificationData.data || {},
      isRead: false,
      isDelivered: false,
      readAt: null,
      deliveredAt: null
    });

    await simulateNotificationDelivery(notification);

    await update('notifications', notification.id, {
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

export const sendBulkNotifications = async (recipientIds, notificationData) => {
  const results = [];
  for (const recipientId of recipientIds) {
    try {
      const notification = await sendNotification({ ...notificationData, recipientId });
      results.push({ recipientId, status: 'success', notification });
    } catch (error) {
      results.push({ recipientId, status: 'error', error: error.message });
    }
  }
  return results;
};

export const getUserNotifications = async (userId, options = {}) => {
  const { limit = 20, page = 1, unreadOnly = false, type = null } = options;

  // Use mongoose directly to get all notifications for this user
  const { getModel } = await import('../config/database.js');
  const Model = getModel('notifications');
  
  let query = { recipientId: userId, isDeleted: { $ne: true } };
  if (unreadOnly) query.isRead = false;
  if (type) query.type = type;

  const allDocs = await Model.find(query).sort({ createdAt: -1 }).lean();
  
  // Ensure all docs have id field
  const allNotifications = allDocs.map(doc => ({
    ...doc,
    id: doc.id || doc._id.toString(),
    _id: undefined
  }));

  const startIndex = (page - 1) * limit;
  const notifications = allNotifications.slice(startIndex, startIndex + limit);
  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return {
    notifications,
    pagination: {
      total: allNotifications.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(allNotifications.length / limit),
      unreadCount
    }
  };
};

export const markAsRead = async (notificationId, userId) => {
  // Try by id field first, then by _id
  let notifications = await find('notifications', { id: notificationId, recipientId: userId });
  if (!notifications.length) {
    // Fallback: find by _id directly using mongoose
    const { getModel } = await import('../config/database.js');
    const Model = getModel('notifications');
    const doc = await Model.findById(notificationId).lean();
    if (doc && doc.recipientId === userId) {
      await Model.updateOne({ _id: notificationId }, { $set: { id: notificationId, isRead: true, readAt: new Date().toISOString() } });
      return { ...doc, id: notificationId, isRead: true };
    }
    throw new Error('Notification not found');
  }
  const notification = notifications[0];
  if (!notification.isRead) {
    return update('notifications', notification.id, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }
  return notification;
};

export const markAllAsRead = async (userId) => {
  const unreadNotifications = await find('notifications', { recipientId: userId, isRead: false });
  const readAt = new Date().toISOString();
  const results = [];
  for (const notification of unreadNotifications) {
    const updated = await update('notifications', notification.id, { isRead: true, readAt });
    results.push(updated);
  }
  return results;
};

export const deleteNotification = async (notificationId, userId) => {
  // Try by id field first
  let notifications = await find('notifications', { id: notificationId, recipientId: userId });
  
  if (!notifications.length) {
    // Fallback: find by _id directly using mongoose
    const { getModel } = await import('../config/database.js');
    const Model = getModel('notifications');
    const doc = await Model.findById(notificationId).lean();
    if (doc && doc.recipientId === userId) {
      await Model.updateOne(
        { _id: notificationId },
        { $set: { id: notificationId, isDeleted: true, deletedAt: new Date().toISOString() } }
      );
      return { success: true };
    }
    throw new Error('Notification not found');
  }
  
  const notification = notifications[0];
  return update('notifications', notification.id, {
    isDeleted: true,
    deletedAt: new Date().toISOString()
  });
};

export const sendAppointmentReminder = async (booking) => {
  return sendNotification({
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
  });
};

export const sendWellnessReminder = async (userId) => {
  return sendNotification({
    recipientId: userId,
    title: 'Wellness Check-in Reminder',
    message: 'Time to update your daily wellness metrics!',
    type: 'wellness',
    priority: 'low',
    data: { action: 'wellness-checkin' }
  });
};

export const sendSystemNotification = async (userId, title, message, data = {}) => {
  return sendNotification({ recipientId: userId, title, message, type: 'system', priority: 'normal', data });
};

const simulateNotificationDelivery = async (notification) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`📱 [${notification.type.toUpperCase()}] ${notification.title}`);
  return true;
};

export const scheduleNotifications = () => {
  console.log('📅 Notification scheduling service started');
};

export const getNotificationStats = async () => {
  const allNotifications = await find('notifications', {});
  const stats = {
    total: allNotifications.length,
    delivered: allNotifications.filter(n => n.isDelivered).length,
    read: allNotifications.filter(n => n.isRead).length,
    unread: allNotifications.filter(n => !n.isRead).length,
    byType: {},
    byPriority: {}
  };
  allNotifications.forEach(n => {
    stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
  });
  return stats;
};
