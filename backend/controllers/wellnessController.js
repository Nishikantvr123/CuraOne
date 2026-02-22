import { 
  findOne, 
  find, 
  create, 
  update, 
  deleteOne,
  aggregate 
} from '../config/database.js';
import { validateWellnessCheckIn } from '../utils/validation.js';

// @desc    Create wellness check-in
// @route   POST /api/wellness/checkin
// @access  Private (Patient)
export const createWellnessCheckIn = async (req, res, next) => {
  try {
    const checkInData = {
      ...req.body,
      userId: req.user.id
    };

    // Validate check-in data
    const validation = validateWellnessCheckIn(checkInData);
    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.errors.join(', '));
    }

    // Check if user already has a check-in for today
    const today = new Date().toISOString().split('T')[0];
    const existingCheckIn = findOne('wellness_checkins', {
      userId: req.user.id,
      date: today
    });

    if (existingCheckIn) {
      res.status(400);
      throw new Error('Wellness check-in already exists for today. Use update instead.');
    }

    // Create wellness check-in
    const newCheckIn = create('wellness_checkins', {
      userId: req.user.id,
      date: today,
      metrics: checkInData.metrics,
      notes: checkInData.notes || '',
      mood: checkInData.mood,
      symptoms: checkInData.symptoms || [],
      sleepHours: checkInData.sleepHours,
      energyLevel: checkInData.energyLevel,
      stressLevel: checkInData.stressLevel,
      painLevel: checkInData.painLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Calculate wellness score
    const wellnessScore = calculateWellnessScore(newCheckIn);
    const updatedCheckIn = update('wellness_checkins', newCheckIn.id, {
      wellnessScore
    });

    res.status(201).json({
      success: true,
      message: 'Wellness check-in created successfully',
      data: { checkIn: updatedCheckIn }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness history
// @route   GET /api/wellness/history
// @access  Private (Patient)
export const getWellnessHistory = async (req, res, next) => {
  try {
    const { 
      limit = 30, 
      page = 1, 
      startDate = null, 
      endDate = null,
      metricType = null 
    } = req.query;

    let query = { userId: req.user.id };

    // Add date filters
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    // Get check-ins with pagination
    const allCheckIns = find('wellness_checkins', query)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const startIndex = (page - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const checkIns = allCheckIns.slice(startIndex, endIndex);

    // Filter by specific metric if requested
    let processedCheckIns = checkIns;
    if (metricType) {
      processedCheckIns = checkIns.map(checkIn => ({
        ...checkIn,
        metrics: checkIn.metrics.filter(metric => metric.type === metricType)
      }));
    }

    res.json({
      success: true,
      data: {
        checkIns: processedCheckIns,
        pagination: {
          total: allCheckIns.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(allCheckIns.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness statistics
// @route   GET /api/wellness/stats
// @access  Private (Patient)
export const getWellnessStats = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    const checkIns = find('wellness_checkins', {
      userId: req.user.id,
      date: { $gte: startDateString }
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (checkIns.length === 0) {
      return res.json({
        success: true,
        data: {
          period: periodDays,
          totalCheckIns: 0,
          averageWellnessScore: 0,
          trends: {},
          insights: ['No check-in data available for this period']
        }
      });
    }

    // Calculate statistics
    const stats = calculateWellnessStats(checkIns, periodDays);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update wellness check-in
// @route   PUT /api/wellness/checkin/:id
// @access  Private (Patient)
export const updateWellnessCheckIn = async (req, res, next) => {
  try {
    const checkIn = findOne('wellness_checkins', { id: req.params.id });

    if (!checkIn) {
      res.status(404);
      throw new Error('Wellness check-in not found');
    }

    // Check ownership
    if (checkIn.userId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Validate update data
    if (updateData.metrics) {
      const validation = validateWellnessCheckIn(updateData);
      if (!validation.isValid) {
        res.status(400);
        throw new Error(validation.errors.join(', '));
      }
    }

    const updatedCheckIn = update('wellness_checkins', req.params.id, updateData);

    // Recalculate wellness score
    const wellnessScore = calculateWellnessScore(updatedCheckIn);
    const finalCheckIn = update('wellness_checkins', req.params.id, {
      wellnessScore
    });

    res.json({
      success: true,
      message: 'Wellness check-in updated successfully',
      data: { checkIn: finalCheckIn }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete wellness check-in
// @route   DELETE /api/wellness/checkin/:id
// @access  Private (Patient)
export const deleteWellnessCheckIn = async (req, res, next) => {
  try {
    const checkIn = findOne('wellness_checkins', { id: req.params.id });

    if (!checkIn) {
      res.status(404);
      throw new Error('Wellness check-in not found');
    }

    // Check ownership
    if (checkIn.userId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    deleteOne('wellness_checkins', req.params.id);

    res.json({
      success: true,
      message: 'Wellness check-in deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness insights
// @route   GET /api/wellness/insights
// @access  Private (Patient)
export const getWellnessInsights = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    const checkIns = find('wellness_checkins', {
      userId: req.user.id,
      date: { $gte: startDateString }
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const insights = generateWellnessInsights(checkIns, periodDays);

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate wellness score
const calculateWellnessScore = (checkIn) => {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Add metric scores
  if (checkIn.metrics && checkIn.metrics.length > 0) {
    checkIn.metrics.forEach(metric => {
      totalScore += metric.value;
      maxPossibleScore += 10; // Assuming max value is 10
    });
  }

  // Add other factors
  if (checkIn.energyLevel !== undefined) {
    totalScore += checkIn.energyLevel;
    maxPossibleScore += 10;
  }

  if (checkIn.stressLevel !== undefined) {
    totalScore += (11 - checkIn.stressLevel); // Invert stress level
    maxPossibleScore += 10;
  }

  if (checkIn.painLevel !== undefined) {
    totalScore += (11 - checkIn.painLevel); // Invert pain level
    maxPossibleScore += 10;
  }

  if (checkIn.sleepHours !== undefined) {
    // Optimal sleep is around 7-9 hours
    const sleepScore = checkIn.sleepHours >= 7 && checkIn.sleepHours <= 9 ? 10 : 
                     checkIn.sleepHours >= 6 && checkIn.sleepHours <= 10 ? 7 :
                     checkIn.sleepHours >= 5 && checkIn.sleepHours <= 11 ? 5 : 3;
    totalScore += sleepScore;
    maxPossibleScore += 10;
  }

  // Calculate percentage
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

// Helper function to calculate wellness statistics
const calculateWellnessStats = (checkIns, periodDays) => {
  const totalCheckIns = checkIns.length;
  
  // Average wellness score
  const averageWellnessScore = totalCheckIns > 0 
    ? Math.round(checkIns.reduce((sum, checkIn) => sum + (checkIn.wellnessScore || 0), 0) / totalCheckIns)
    : 0;

  // Calculate trends for different metrics
  const trends = {};
  const metricTypes = ['energy', 'mood', 'sleep', 'stress', 'pain'];
  
  metricTypes.forEach(metricType => {
    const values = [];
    checkIns.forEach(checkIn => {
      if (checkIn.metrics) {
        const metric = checkIn.metrics.find(m => m.type === metricType);
        if (metric) values.push(metric.value);
      }
      
      // Also check direct properties
      if (metricType === 'energy' && checkIn.energyLevel !== undefined) {
        values.push(checkIn.energyLevel);
      } else if (metricType === 'stress' && checkIn.stressLevel !== undefined) {
        values.push(checkIn.stressLevel);
      } else if (metricType === 'pain' && checkIn.painLevel !== undefined) {
        values.push(checkIn.painLevel);
      }
    });

    if (values.length > 1) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const change = secondAvg - firstAvg;
      trends[metricType] = {
        direction: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
        change: Math.round(change * 10) / 10,
        current: Math.round(secondAvg * 10) / 10
      };
    }
  });

  // Generate insights
  const insights = [];
  
  if (averageWellnessScore >= 80) {
    insights.push('Great job! Your overall wellness is excellent.');
  } else if (averageWellnessScore >= 60) {
    insights.push('Your wellness is good, but there\'s room for improvement.');
  } else {
    insights.push('Consider focusing more on your daily wellness practices.');
  }

  // Check consistency
  const consistencyRate = (totalCheckIns / periodDays) * 100;
  if (consistencyRate >= 80) {
    insights.push('Excellent consistency with your wellness tracking!');
  } else if (consistencyRate >= 50) {
    insights.push('Good tracking consistency. Try to check in more regularly.');
  } else {
    insights.push('Consider checking in more frequently for better insights.');
  }

  return {
    period: periodDays,
    totalCheckIns,
    consistencyRate: Math.round(consistencyRate),
    averageWellnessScore,
    trends,
    insights
  };
};

// Helper function to generate wellness insights
const generateWellnessInsights = (checkIns, periodDays) => {
  const insights = [];

  if (checkIns.length === 0) {
    insights.push({
      type: 'info',
      title: 'Start Tracking',
      message: 'Begin your wellness journey by logging your daily check-ins.',
      actionable: true,
      action: 'Create your first wellness check-in'
    });
    return insights;
  }

  // Sleep insights
  const sleepData = checkIns.filter(c => c.sleepHours !== undefined);
  if (sleepData.length > 0) {
    const avgSleep = sleepData.reduce((sum, c) => sum + c.sleepHours, 0) / sleepData.length;
    if (avgSleep < 7) {
      insights.push({
        type: 'warning',
        title: 'Sleep Optimization',
        message: `Your average sleep is ${avgSleep.toFixed(1)} hours. Consider aiming for 7-9 hours nightly.`,
        actionable: true,
        action: 'Set a consistent bedtime routine'
      });
    } else if (avgSleep >= 7 && avgSleep <= 9) {
      insights.push({
        type: 'success',
        title: 'Great Sleep Habits',
        message: `Excellent! You're averaging ${avgSleep.toFixed(1)} hours of sleep.`,
        actionable: false
      });
    }
  }

  // Stress pattern insights
  const stressData = checkIns.filter(c => c.stressLevel !== undefined);
  if (stressData.length > 5) {
    const highStressDays = stressData.filter(c => c.stressLevel >= 7).length;
    const stressRate = (highStressDays / stressData.length) * 100;
    
    if (stressRate > 40) {
      insights.push({
        type: 'warning',
        title: 'Stress Management',
        message: `You've had high stress levels ${Math.round(stressRate)}% of tracked days.`,
        actionable: true,
        action: 'Consider stress reduction techniques like meditation'
      });
    }
  }

  // Energy level insights
  const recentCheckIns = checkIns.slice(-7); // Last 7 check-ins
  const energyTrend = recentCheckIns.map(c => c.energyLevel).filter(e => e !== undefined);
  
  if (energyTrend.length >= 3) {
    const recentAvg = energyTrend.reduce((sum, e) => sum + e, 0) / energyTrend.length;
    if (recentAvg < 5) {
      insights.push({
        type: 'info',
        title: 'Energy Boost Needed',
        message: 'Your recent energy levels have been low. Consider reviewing your sleep and nutrition.',
        actionable: true,
        action: 'Schedule a wellness consultation'
      });
    }
  }

  // Consistency insights
  const consistencyRate = (checkIns.length / periodDays) * 100;
  if (consistencyRate < 50) {
    insights.push({
      type: 'info',
      title: 'Tracking Consistency',
      message: 'Regular check-ins provide better health insights. Try setting daily reminders.',
      actionable: true,
      action: 'Enable daily wellness reminders'
    });
  }

  return insights;
};