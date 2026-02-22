import {
  getUserNotifications,
  markAsRead as serviceMarkAsRead,
  markAllAsRead as serviceMarkAllAsRead,
  deleteNotification as serviceDeleteNotification,
  sendBulkNotifications,
  getNotificationStats as serviceGetNotificationStats
} from '../services/notificationService.js';
import { findOne } from '../config/database.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const {
      limit = 20,
      page = 1,
      unreadOnly = 'false',
      type = null
    } = req.query;

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      unreadOnly: unreadOnly === 'true',
      type
    };

    const result = getUserNotifications(req.user.id, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res, next) => {
  try {
    const notification = findOne('notifications', {
      id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = serviceMarkAsRead(req.params.id, req.user.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const notifications = serviceMarkAllAsRead(req.user.id);

    res.json({
      success: true,
      message: `${notifications.length} notifications marked as read`,
      data: { count: notifications.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = serviceDeleteNotification(req.params.id, req.user.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk notification
// @route   POST /api/notifications/bulk
// @access  Private (Admin)
export const sendBulkNotification = async (req, res, next) => {
  try {
    const { recipientIds, title, message, type, priority, data } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      res.status(400);
      throw new Error('Recipient IDs are required');
    }

    if (!title || !message) {
      res.status(400);
      throw new Error('Title and message are required');
    }

    const notificationData = {
      title,
      message,
      type: type || 'system',
      priority: priority || 'normal',
      data: data || {}
    };

    const results = await sendBulkNotifications(recipientIds, notificationData);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      message: `Bulk notification sent to ${successCount} recipients`,
      data: {
        successCount,
        errorCount,
        results: errorCount > 0 ? results.filter(r => r.status === 'error') : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification statistics (Admin)
// @route   GET /api/notifications/admin/stats
// @access  Private (Admin)
export const getNotificationStats = async (req, res, next) => {
  try {
    const stats = serviceGetNotificationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};