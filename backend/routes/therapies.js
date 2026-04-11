import express from 'express';
import {
  getAllTherapies,
  getTherapyById,
  createTherapy,
  updateTherapy,
  deleteTherapy,
  getTherapiesByCategory
} from '../controllers/therapyController.js';
import { protect, admin, practitioner } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (for browsing available therapies)
router.get('/', getAllTherapies);
router.get('/category/:category', getTherapiesByCategory);
router.get('/:id', getTherapyById);

// Protected routes - Admin/Practitioner only
router.use(protect);
router.post('/', admin, createTherapy);
router.put('/:id', admin, updateTherapy);
router.delete('/:id', admin, deleteTherapy);

export default router;