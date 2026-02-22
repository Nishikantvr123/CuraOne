/**
 * Chat Routes for CuraBot
 * Handles all chat-related endpoints
 */

import express from 'express';
import { sendMessage, getHistory, getSuggestions } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/chat - Send a message to CuraBot
router.post('/', sendMessage);

// GET /api/chat/history - Get chat history
router.get('/history', getHistory);

// GET /api/chat/suggestions - Get quick suggestions
router.get('/suggestions', getSuggestions);

export default router;
