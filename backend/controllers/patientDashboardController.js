import { findMany, findOne } from '../config/database.js';

// Get patient progress metrics
export const getPatientProgress = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Get all bookings for this patient
    const bookings = findMany('bookings', { patientId });
    
    // Calculate progress metrics
    const completedSessions = bookings.filter(b => b.status === 'completed').length;
    const totalSessions = bookings.length;
    const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    // Calculate streak (consecutive days with sessions)
    const completedBookings = bookings
      .filter(b => b.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    let lastDate = null;
    
    for (const booking of completedBookings) {
      const bookingDate = new Date(booking.date);
      if (!lastDate) {
        streak = 1;
        lastDate = bookingDate;
      } else {
        const daysDiff = Math.floor((lastDate - bookingDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          streak++;
          lastDate = bookingDate;
        } else {
          break;
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        completedSessions,
        totalSessions,
        progressPercentage,
        streak,
        currentProgram: 'Personalized Ayurvedic Treatment'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get upcoming sessions for patient
export const getUpcomingSessions = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Get all future bookings for this patient
    const allBookings = findMany('bookings', { patientId });
    const now = new Date();
    
    const upcomingSessions = allBookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= now && (b.status === 'confirmed' || b.status === 'pending');
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5) // Get next 5 sessions
      .map(booking => {
        // Get therapy details
        const therapy = findOne('therapies', { id: booking.therapyId });
        // Get practitioner details
        const practitioner = findOne('users', { id: booking.practitionerId, role: 'practitioner' });
        
        return {
          id: booking.id,
          therapy: therapy?.name || 'Unknown Therapy',
          date: formatDate(booking.date),
          time: booking.time || '10:00 AM',
          practitioner: practitioner ? `${practitioner.firstName} ${practitioner.lastName}` : 'TBA',
          duration: therapy?.duration || 60,
          location: booking.location || 'Main Center',
          status: booking.status
        };
      });
    
    res.json({
      success: true,
      data: upcomingSessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Get wellness check-in data
export const getWellnessData = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Get latest wellness check-in
    const wellnessCheckins = findMany('wellness_checkins', { patientId });
    
    if (wellnessCheckins.length === 0) {
      // Return default values for new patients
      return res.json({
        success: true,
        data: {
          energyLevel: 50,
          sleepQuality: 50,
          mood: 50,
          stressLevel: 50,
          lastUpdated: null
        }
      });
    }
    
    // Get the most recent check-in
    const latestCheckin = wellnessCheckins.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    
    res.json({
      success: true,
      data: {
        energyLevel: latestCheckin.energyLevel || 50,
        sleepQuality: latestCheckin.sleepQuality || 50,
        mood: latestCheckin.mood || 50,
        stressLevel: latestCheckin.stressLevel || 50,
        lastUpdated: latestCheckin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get wellness progress over time
export const getWellnessProgress = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Get all wellness check-ins for the last 7 weeks
    const wellnessCheckins = findMany('wellness_checkins', { patientId });
    
    if (wellnessCheckins.length === 0) {
      // Return empty data for new patients
      return res.json({
        success: true,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Current'],
          energy: [50, 50, 50, 50, 50, 50, 50],
          sleep: [50, 50, 50, 50, 50, 50, 50],
          stress: [50, 50, 50, 50, 50, 50, 50]
        }
      });
    }
    
    // Group by week and calculate averages
    const sortedCheckins = wellnessCheckins.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    const weeklyData = groupByWeek(sortedCheckins);
    
    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to group wellness data by week
function groupByWeek(checkins) {
  const weeks = 7;
  const labels = [];
  const energy = [];
  const sleep = [];
  const stress = [];
  
  for (let i = 0; i < weeks; i++) {
    labels.push(i === weeks - 1 ? 'Current' : `Week ${i + 1}`);
    
    // Calculate average for this week
    const weekCheckins = checkins.slice(i * Math.floor(checkins.length / weeks), (i + 1) * Math.floor(checkins.length / weeks));
    
    if (weekCheckins.length > 0) {
      energy.push(Math.round(weekCheckins.reduce((sum, c) => sum + (c.energyLevel || 50), 0) / weekCheckins.length));
      sleep.push(Math.round(weekCheckins.reduce((sum, c) => sum + (c.sleepQuality || 50), 0) / weekCheckins.length));
      stress.push(Math.round(weekCheckins.reduce((sum, c) => sum + (c.stressLevel || 50), 0) / weekCheckins.length));
    } else {
      energy.push(50);
      sleep.push(50);
      stress.push(50);
    }
  }
  
  return { labels, energy, sleep, stress };
}
