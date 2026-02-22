/**
 * Payment Controller for CuraOne
 * Mock Razorpay/Stripe payment processing
 */

import { findMany, findOne, insertOne, updateOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Create a new payment
 * @route   POST /api/payments/create
 * @access  Private
 */
export const createPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      amount,
      currency = 'USD',
      paymentMethod = 'card',
      description
    } = req.body;

    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Valid amount is required');
    }

    let booking = null;
    if (bookingId) {
      booking = findOne('bookings', { id: bookingId });
      if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
      }
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const paymentId = `PAY_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    const payment = {
      id: uuidv4(),
      orderId,
      paymentId,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      bookingId: bookingId || null,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      paymentMethod,
      description: description || (booking ? `Payment for therapy session` : 'CuraOne Payment'),
      status: 'pending',
      gatewayResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await insertOne('payments', payment);

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment,
        checkoutDetails: {
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          key: 'mock_key_xxxxxxxxxxxxxx',
          name: 'CuraOne',
          description: payment.description,
          prefill: {
            name: payment.userName,
            email: payment.userEmail
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process payment webhook (simulate success)
 * @route   POST /api/payments/webhook
 * @access  Public (webhook endpoint)
 */
export const processWebhook = async (req, res, next) => {
  try {
    const { orderId, paymentId, status = 'success', signature } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Order ID is required');
    }

    const payment = findOne('payments', { orderId });
    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    const isSuccess = status === 'success' || status === 'captured';
    
    const updatedPayment = updateOne('payments', { id: payment.id }, {
      status: isSuccess ? 'completed' : 'failed',
      gatewayPaymentId: paymentId || payment.paymentId,
      gatewayResponse: {
        status,
        signature: signature || 'mock_signature',
        processedAt: new Date().toISOString()
      },
      completedAt: isSuccess ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });

    if (isSuccess && payment.bookingId) {
      updateOne('bookings', { id: payment.bookingId }, {
        paymentStatus: 'paid',
        paymentId: payment.id,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Payment ${isSuccess ? 'completed' : 'failed'} successfully`,
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's payments
 * @route   GET /api/payments/my
 * @access  Private
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let payments = findMany('payments', { userId: req.user.id }, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (status) {
      payments = payments.filter(p => p.status === status);
    }

    const total = payments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: paginatedPayments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = findOne('payments', { id: req.params.id });

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this payment');
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  processWebhook,
  getMyPayments,
  getPaymentById
};
