/**
 * Prescription Routes for CuraOne
 * E-Prescription system endpoints
 */

import express from 'express';
import { createPrescription, getMyPrescriptions, getPrescriptionById, updatePrescription } from '../controllers/prescriptionController.js';
import { protect, practitioner, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/prescriptions - Create new prescription (practitioners only)
router.post('/', practitioner, createPrescription);

// GET /api/prescriptions/my - Get current user's prescriptions
router.get('/my', getMyPrescriptions);

// GET /api/prescriptions/:id - Get specific prescription
router.get('/:id', getPrescriptionById);

// PUT /api/prescriptions/:id - Update prescription (practitioners only)
router.put('/:id', practitioner, updatePrescription);

export default router;
