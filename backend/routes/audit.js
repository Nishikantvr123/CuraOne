/**
 * Audit Log Routes for CuraOne
 * Admin-only access to audit logs
 */

import express from 'express';
import { getAuditLogs, getAuditStats, getUserAuditLogs } from '../controllers/auditController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// GET /api/audit - Get all audit logs with filters
router.get('/', getAuditLogs);

// GET /api/audit/stats - Get audit statistics
router.get('/stats', getAuditStats);

// GET /api/audit/user/:userId - Get logs for specific user
router.get('/user/:userId', getUserAuditLogs);

export default router;
