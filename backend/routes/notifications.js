import express from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotification,
  getNotificationStats
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.post('/bulk', admin, sendBulkNotification);
router.get('/admin/stats', admin, getNotificationStats);

export default router;