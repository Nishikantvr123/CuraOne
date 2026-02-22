/**
 * Dosha Quiz Routes for CuraOne
 * Ayurvedic constitution assessment
 */

import express from 'express';
import { submitQuiz, getMyDoshaProfile, getDoshaRecommendations, getQuizQuestions } from '../controllers/doshaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/dosha/questions - Get quiz questions
router.get('/questions', getQuizQuestions);

// POST /api/dosha/quiz - Submit quiz and get results
router.post('/quiz', submitQuiz);

// GET /api/dosha/profile - Get user's dosha profile
router.get('/profile', getMyDoshaProfile);

// GET /api/dosha/recommendations - Get therapy recommendations based on dosha
router.get('/recommendations', getDoshaRecommendations);

export default router;
