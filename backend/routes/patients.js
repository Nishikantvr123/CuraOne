import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { protect, admin, practitioner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all patients (admin and practitioners only)
router.get('/', practitioner, getAllPatients);

// Get patient by ID
router.get('/:id', getPatientById);

// Create new patient (admin and practitioners only)
router.post('/', practitioner, createPatient);

// Update patient
router.put('/:id', updatePatient);

// Delete patient (admin only)
router.delete('/:id', admin, deletePatient);

export default router;
