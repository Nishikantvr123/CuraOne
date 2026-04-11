import express from 'express';
import {
  getPatientProgress,
  getUpcomingSessions,
  getWellnessData,
  getWellnessProgress
} from '../controllers/patientDashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard data routes
router.get('/progress', getPatientProgress);
router.get('/sessions', getUpcomingSessions);
router.get('/wellness', getWellnessData);
router.get('/wellness/progress', getWellnessProgress);

export default router;
