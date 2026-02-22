/**
 * Dosha Quiz Controller for CuraOne
 * Ayurvedic constitution assessment system
 */

import { findMany, findOne, insertOne, updateOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const DOSHA_QUESTIONS = [
  {
    id: 1,
    category: 'physical',
    question: 'What best describes your body frame?',
    options: [
      { text: 'Thin and light, hard to gain weight', dosha: 'vata', score: 1 },
      { text: 'Medium build, athletic', dosha: 'pitta', score: 1 },
      { text: 'Large frame, gains weight easily', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 2,
    category: 'physical',
    question: 'How is your skin typically?',
    options: [
      { text: 'Dry, rough, or cool', dosha: 'vata', score: 1 },
      { text: 'Warm, oily, prone to rashes', dosha: 'pitta', score: 1 },
      { text: 'Thick, smooth, and moist', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 3,
    category: 'physical',
    question: 'What is your hair type?',
    options: [
      { text: 'Dry, brittle, or curly', dosha: 'vata', score: 1 },
      { text: 'Fine, straight, prone to graying', dosha: 'pitta', score: 1 },
      { text: 'Thick, wavy, lustrous', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 4,
    category: 'digestion',
    question: 'How would you describe your appetite?',
    options: [
      { text: 'Irregular, forget to eat sometimes', dosha: 'vata', score: 1 },
      { text: 'Strong, get irritable if I miss meals', dosha: 'pitta', score: 1 },
      { text: 'Steady, can skip meals easily', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 5,
    category: 'digestion',
    question: 'How is your digestion?',
    options: [
      { text: 'Variable, bloating or gas', dosha: 'vata', score: 1 },
      { text: 'Quick, sometimes acidic', dosha: 'pitta', score: 1 },
      { text: 'Slow but steady', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 6,
    category: 'mental',
    question: 'How do you typically handle stress?',
    options: [
      { text: 'Become anxious or worried', dosha: 'vata', score: 1 },
      { text: 'Become irritable or angry', dosha: 'pitta', score: 1 },
      { text: 'Become withdrawn or depressed', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 7,
    category: 'mental',
    question: 'What best describes your learning style?',
    options: [
      { text: 'Quick to learn, quick to forget', dosha: 'vata', score: 1 },
      { text: 'Sharp focus, good memory', dosha: 'pitta', score: 1 },
      { text: 'Slow to learn, never forget', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 8,
    category: 'sleep',
    question: 'How is your sleep pattern?',
    options: [
      { text: 'Light, interrupted, or irregular', dosha: 'vata', score: 1 },
      { text: 'Moderate, usually sound', dosha: 'pitta', score: 1 },
      { text: 'Deep and long, hard to wake up', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 9,
    category: 'energy',
    question: 'How would you describe your energy levels?',
    options: [
      { text: 'Variable, comes in bursts', dosha: 'vata', score: 1 },
      { text: 'Moderate and steady', dosha: 'pitta', score: 1 },
      { text: 'Low but sustained', dosha: 'kapha', score: 1 }
    ]
  },
  {
    id: 10,
    category: 'temperament',
    question: 'What best describes your temperament?',
    options: [
      { text: 'Creative, enthusiastic, adaptable', dosha: 'vata', score: 1 },
      { text: 'Focused, ambitious, determined', dosha: 'pitta', score: 1 },
      { text: 'Calm, loyal, patient', dosha: 'kapha', score: 1 }
    ]
  }
];

const DOSHA_RECOMMENDATIONS = {
  vata: {
    description: 'Vata types are creative, energetic, and quick-thinking. When balanced, they are lively and enthusiastic. When imbalanced, they may experience anxiety, dry skin, and digestive issues.',
    therapies: ['Abhyanga (Oil Massage)', 'Shirodhara', 'Basti (Enema Therapy)'],
    lifestyle: [
      'Maintain regular routines for eating and sleeping',
      'Stay warm and avoid cold, dry environments',
      'Practice calming exercises like yoga and meditation',
      'Eat warm, cooked, and nourishing foods'
    ],
    avoid: ['Cold foods and drinks', 'Excessive travel', 'Irregular schedules', 'Raw foods']
  },
  pitta: {
    description: 'Pitta types are intelligent, focused, and ambitious. When balanced, they are warm and loving. When imbalanced, they may experience inflammation, anger, and skin issues.',
    therapies: ['Shirodhara', 'Virechana (Purgation)', 'Cooling Oil Massage'],
    lifestyle: [
      'Avoid excessive heat and direct sunlight',
      'Practice cooling exercises like swimming',
      'Take breaks and avoid overworking',
      'Eat cooling foods and stay hydrated'
    ],
    avoid: ['Spicy and acidic foods', 'Excessive competition', 'Alcohol and caffeine', 'Overexertion']
  },
  kapha: {
    description: 'Kapha types are calm, steady, and nurturing. When balanced, they are loving and grounded. When imbalanced, they may experience weight gain, lethargy, and congestion.',
    therapies: ['Udvartana (Powder Massage)', 'Nasya', 'Panchakarma Detox'],
    lifestyle: [
      'Stay active with regular vigorous exercise',
      'Wake up early and avoid daytime naps',
      'Eat light, warm, and spicy foods',
      'Seek variety and new experiences'
    ],
    avoid: ['Heavy and oily foods', 'Excessive sleep', 'Cold and damp environments', 'Sedentary lifestyle']
  }
};

/**
 * @desc    Get quiz questions
 * @route   GET /api/dosha/questions
 * @access  Private
 */
export const getQuizQuestions = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        questions: DOSHA_QUESTIONS,
        totalQuestions: DOSHA_QUESTIONS.length,
        categories: [...new Set(DOSHA_QUESTIONS.map(q => q.category))]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz and calculate dosha
 * @route   POST /api/dosha/quiz
 * @access  Private
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400);
      throw new Error('Quiz answers are required');
    }

    const scores = {
      vata: 0,
      pitta: 0,
      kapha: 0
    };

    for (const answer of answers) {
      const question = DOSHA_QUESTIONS.find(q => q.id === answer.questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.text === answer.answer);
        if (selectedOption) {
          scores[selectedOption.dosha] += selectedOption.score;
        }
      }
    }

    const total = scores.vata + scores.pitta + scores.kapha;
    const percentages = {
      vata: Math.round((scores.vata / total) * 100),
      pitta: Math.round((scores.pitta / total) * 100),
      kapha: Math.round((scores.kapha / total) * 100)
    };

    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const secondary = Object.entries(scores).sort((a, b) => b[1] - a[1])[1][0];

    const profile = {
      id: uuidv4(),
      userId: req.user.id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      scores,
      percentages,
      dominant,
      secondary,
      constitution: percentages[dominant] > 50 ? dominant : `${dominant}-${secondary}`,
      recommendations: DOSHA_RECOMMENDATIONS[dominant],
      answers,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const existingProfile = findOne('doshaProfiles', { userId: req.user.id });
    if (existingProfile) {
      updateOne('doshaProfiles', { id: existingProfile.id }, {
        ...profile,
        id: existingProfile.id,
        previousResults: [
          ...(existingProfile.previousResults || []),
          {
            scores: existingProfile.scores,
            dominant: existingProfile.dominant,
            completedAt: existingProfile.completedAt
          }
        ]
      });
    } else {
      await insertOne('doshaProfiles', profile);
    }

    res.json({
      success: true,
      message: 'Dosha quiz completed successfully',
      data: {
        profile: {
          scores,
          percentages,
          dominant,
          secondary,
          constitution: profile.constitution
        },
        recommendations: DOSHA_RECOMMENDATIONS[dominant],
        suggestedTherapies: DOSHA_RECOMMENDATIONS[dominant].therapies
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's dosha profile
 * @route   GET /api/dosha/profile
 * @access  Private
 */
export const getMyDoshaProfile = async (req, res, next) => {
  try {
    const profile = findOne('doshaProfiles', { userId: req.user.id });

    if (!profile) {
      return res.json({
        success: true,
        data: null,
        message: 'No dosha profile found. Please take the quiz to discover your constitution.'
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          scores: profile.scores,
          percentages: profile.percentages,
          dominant: profile.dominant,
          secondary: profile.secondary,
          constitution: profile.constitution,
          completedAt: profile.completedAt
        },
        recommendations: DOSHA_RECOMMENDATIONS[profile.dominant],
        history: profile.previousResults || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get therapy recommendations based on dosha
 * @route   GET /api/dosha/recommendations
 * @access  Private
 */
export const getDoshaRecommendations = async (req, res, next) => {
  try {
    const { dosha } = req.query;

    if (dosha && DOSHA_RECOMMENDATIONS[dosha.toLowerCase()]) {
      return res.json({
        success: true,
        data: {
          dosha: dosha.toLowerCase(),
          recommendations: DOSHA_RECOMMENDATIONS[dosha.toLowerCase()]
        }
      });
    }

    const profile = findOne('doshaProfiles', { userId: req.user.id });

    if (!profile) {
      return res.json({
        success: true,
        data: {
          message: 'Take the dosha quiz to get personalized recommendations',
          allRecommendations: DOSHA_RECOMMENDATIONS
        }
      });
    }

    res.json({
      success: true,
      data: {
        dosha: profile.dominant,
        recommendations: DOSHA_RECOMMENDATIONS[profile.dominant]
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getQuizQuestions,
  submitQuiz,
  getMyDoshaProfile,
  getDoshaRecommendations
};
