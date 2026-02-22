import express from 'express';
import {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats
} from '../controllers/feedbackController.js';
import { protect, patient, practitioner, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/', patient, createFeedback);
router.get('/my-feedback', patient, getFeedback);
router.put('/:id', patient, updateFeedback);
router.delete('/:id', patient, deleteFeedback);

// Practitioner routes
router.get('/practitioner', practitioner, getFeedback);
router.get('/stats', practitioner, getFeedbackStats);

// Public route for specific feedback (with authorization check inside controller)
router.get('/:id', getFeedbackById);

export default router;