import { findOne, find, create, update, deleteOne } from '../config/database.js';
import { validateFeedback } from '../utils/validation.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private (Patient)
export const createFeedback = async (req, res, next) => {
  try {
    const feedbackData = {
      ...req.body,
      patientId: req.user.id
    };

    // Validate feedback data
    const validation = validateFeedback(feedbackData);
    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.errors.join(', '));
    }

    // Check if session exists and belongs to the user
    const session = findOne('bookings', { 
      id: feedbackData.sessionId,
      patientId: req.user.id 
    });

    if (!session) {
      res.status(404);
      throw new Error('Session not found or access denied');
    }

    if (session.status !== 'completed') {
      res.status(400);
      throw new Error('Can only provide feedback for completed sessions');
    }

    // Check if feedback already exists
    const existingFeedback = findOne('feedback', { 
      sessionId: feedbackData.sessionId,
      patientId: req.user.id 
    });

    if (existingFeedback) {
      res.status(400);
      throw new Error('Feedback already exists for this session');
    }

    // Create feedback
    const feedback = create('feedback', {
      patientId: req.user.id,
      sessionId: feedbackData.sessionId,
      practitionerId: session.practitionerId,
      therapyId: session.therapyId,
      rating: feedbackData.rating,
      comment: feedbackData.comment || '',
      symptoms: feedbackData.symptoms || [],
      improvements: feedbackData.improvements || [],
      sideEffects: feedbackData.sideEffects || [],
      wouldRecommend: feedbackData.wouldRecommend || true,
      followUpNeeded: feedbackData.followUpNeeded || false
    });

    // Send notification to practitioner
    await sendNotification({
      recipientId: session.practitionerId,
      title: 'New Feedback Received',
      message: `${req.user.firstName} ${req.user.lastName} has left feedback for their session`,
      type: 'feedback',
      data: { feedbackId: feedback.id, sessionId: session.id }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback
// @route   GET /api/feedback/my-feedback or /api/feedback/practitioner
// @access  Private
export const getFeedback = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, rating, sessionId } = req.query;
    
    let query = {};

    // Build query based on user role
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'practitioner') {
      query.practitionerId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin can see all feedback
    } else {
      res.status(403);
      throw new Error('Access denied');
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Get feedback with pagination
    const allFeedback = find('feedback', query);
    const startIndex = (page - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const feedback = allFeedback.slice(startIndex, endIndex);

    // Populate related data
    const feedbackWithDetails = feedback.map(fb => {
      const patient = findOne('users', { id: fb.patientId });
      const practitioner = findOne('users', { id: fb.practitionerId });
      const session = findOne('bookings', { id: fb.sessionId });
      const therapy = findOne('therapies', { id: fb.therapyId });

      return {
        ...fb,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName
        } : null,
        practitioner: practitioner ? {
          id: practitioner.id,
          firstName: practitioner.firstName,
          lastName: practitioner.lastName
        } : null,
        session: session ? {
          id: session.id,
          scheduledDate: session.scheduledDate,
          scheduledTime: session.scheduledTime
        } : null,
        therapy: therapy ? {
          id: therapy.id,
          name: therapy.name
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        feedback: feedbackWithDetails,
        pagination: {
          total: allFeedback.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(allFeedback.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = findOne('feedback', { id: req.params.id });

    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && feedback.patientId !== req.user.id ||
      req.user.role === 'practitioner' && feedback.practitionerId !== req.user.id
    ) {
      if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied');
      }
    }

    // Populate related data
    const patient = findOne('users', { id: feedback.patientId });
    const practitioner = findOne('users', { id: feedback.practitionerId });
    const session = findOne('bookings', { id: feedback.sessionId });
    const therapy = findOne('therapies', { id: feedback.therapyId });

    const feedbackWithDetails = {
      ...feedback,
      patient: patient ? {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName
      } : null,
      practitioner: practitioner ? {
        id: practitioner.id,
        firstName: practitioner.firstName,
        lastName: practitioner.lastName
      } : null,
      session: session ? {
        id: session.id,
        scheduledDate: session.scheduledDate,
        scheduledTime: session.scheduledTime
      } : null,
      therapy: therapy ? {
        id: therapy.id,
        name: therapy.name
      } : null
    };

    res.json({
      success: true,
      data: { feedback: feedbackWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Patient)
export const updateFeedback = async (req, res, next) => {
  try {
    const feedback = findOne('feedback', { id: req.params.id });

    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }

    // Check ownership
    if (feedback.patientId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    // Validate update data
    const validation = validateFeedback({ ...feedback, ...req.body });
    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.errors.join(', '));
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedFeedback = update('feedback', req.params.id, updateData);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback: updatedFeedback }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Patient)
export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = findOne('feedback', { id: req.params.id });

    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }

    // Check ownership
    if (feedback.patientId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied');
    }

    deleteOne('feedback', { id: req.params.id });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics for practitioner
// @route   GET /api/feedback/stats
// @access  Private (Practitioner)
export const getFeedbackStats = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    const feedback = find('feedback', {
      practitionerId: req.user.id,
      createdAt: { $gte: startDateString }
    });

    if (feedback.length === 0) {
      return res.json({
        success: true,
        data: {
          period: periodDays,
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {},
          recommendationRate: 0,
          commonImprovements: [],
          commonSideEffects: []
        }
      });
    }

    // Calculate statistics
    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedback;
    
    // Rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = feedback.filter(fb => fb.rating === i).length;
    }

    // Recommendation rate
    const recommendationRate = (feedback.filter(fb => fb.wouldRecommend).length / totalFeedback) * 100;

    // Common improvements
    const allImprovements = feedback.flatMap(fb => fb.improvements || []);
    const improvementCounts = {};
    allImprovements.forEach(improvement => {
      improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1;
    });
    const commonImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([improvement, count]) => ({ improvement, count }));

    // Common side effects
    const allSideEffects = feedback.flatMap(fb => fb.sideEffects || []);
    const sideEffectCounts = {};
    allSideEffects.forEach(effect => {
      sideEffectCounts[effect] = (sideEffectCounts[effect] || 0) + 1;
    });
    const commonSideEffects = Object.entries(sideEffectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([effect, count]) => ({ effect, count }));

    const stats = {
      period: periodDays,
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recommendationRate: Math.round(recommendationRate),
      commonImprovements,
      commonSideEffects
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};