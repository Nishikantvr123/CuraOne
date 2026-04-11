import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getRegisteredPatients
} from '../controllers/patientController.js';
import { protect, admin, practitioner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get registered users not yet added to dashboard (admin only)
// ⚠️ This must be BEFORE /:id route
router.get('/registered', admin, getRegisteredPatients);

// Get all patients (admin and practitioners only)
router.get('/', practitioner, getAllPatients);

// Get patient by ID
router.get('/:id', getPatientById);

// Create new patient / add registered user to dashboard (admin only)
router.post('/', admin, createPatient);

// Update patient
router.put('/:id', updatePatient);

// Delete patient (admin only)
router.delete('/:id', admin, deletePatient);

export default router;