/**
 * Chat Controller for CuraBot
 * Handles chat message processing and history retrieval
 */

import { processMessage, getChatHistory, QUICK_SUGGESTIONS } from '../services/chatService.js';

/**
 * @desc    Send a message to CuraBot and get a response
 * @route   POST /api/chat
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400);
      throw new Error('Message is required');
    }
    
    const result = await processMessage(
      req.user.id,
      message,
      req.user.role
    );
    
    if (!result.success) {
      res.status(429);
      throw new Error(result.error);
    }
    
    res.json({
      success: true,
      data: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history for current user
 * @route   GET /api/chat/history
 * @access  Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    
    const history = await getChatHistory(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        messages: history,
        count: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick suggestion options
 * @route   GET /api/chat/suggestions
 * @access  Private
 */
export const getSuggestions = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        suggestions: QUICK_SUGGESTIONS
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendMessage,
  getHistory,
  getSuggestions
};
