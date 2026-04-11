import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getAvailableSlots,
  rescheduleBooking
} from '../controllers/bookingController.js';
import { protect, patient, practitioner, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/', patient, createBooking);
router.get('/my-bookings', patient, getBookings);
router.get('/:id', patient, getBookingById);
router.put('/:id/cancel', patient, cancelBooking);
router.put('/:id/reschedule', patient, rescheduleBooking);

// Practitioner/Admin routes
router.put('/:id/confirm', practitioner, confirmBooking);
router.put('/:id', practitioner, updateBooking);

// Available slots (accessible to patients for booking)
router.get('/available-slots/:practitionerId', patient, getAvailableSlots);

export default router;