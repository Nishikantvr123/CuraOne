import express from 'express';
import {
  createWellnessCheckIn,
  getWellnessHistory,
  getWellnessStats,
  updateWellnessCheckIn,
  deleteWellnessCheckIn,
  getWellnessInsights
} from '../controllers/wellnessController.js';
import { protect, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient wellness routes
router.post('/checkin', patient, createWellnessCheckIn);
router.get('/history', patient, getWellnessHistory);
router.get('/stats', patient, getWellnessStats);
router.get('/insights', patient, getWellnessInsights);
router.put('/checkin/:id', patient, updateWellnessCheckIn);
router.delete('/checkin/:id', patient, deleteWellnessCheckIn);

export default router;