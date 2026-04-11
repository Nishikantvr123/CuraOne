/**
 * Payment Routes for CuraOne
 * Mock Razorpay/Stripe payment system
 */

import express from 'express';
import { createPayment, processWebhook, getMyPayments, getPaymentById } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/payments/webhook - Webhook endpoint (no auth required)
router.post('/webhook', processWebhook);

// Protected routes
router.use(protect);

// POST /api/payments/create - Create new payment
router.post('/create', createPayment);

// GET /api/payments/my - Get current user's payments
router.get('/my', getMyPayments);

// GET /api/payments/:id - Get specific payment
router.get('/:id', getPaymentById);

export default router;
