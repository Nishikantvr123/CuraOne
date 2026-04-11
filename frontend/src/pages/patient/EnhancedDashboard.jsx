import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Activity, 
  Heart, 
  Clock, 
  Plus, 
  TrendingUp, 
  Bell, 
  LogOut, 
  Leaf,
  BarChart3,
  Target,
  Award,
  Zap,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  ProgressLineChart,
  SessionProgressChart,
  WellnessMetricsChart,
  RecoveryMilestonesChart
} from '../../components/charts/ProgressChart';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import BookingModal from '../../components/modals/BookingModal';
import WellnessModal from '../../components/modals/WellnessModal';
import PatientProfileView from '../../components/modals/PatientProfileView';
import RealtimeStatus from '../../components/realtime/RealtimeStatus';
import toast from '../../utils/toast';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick }) => (
  <div 
    className={cn(
      "bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-200",
      onClick ? "cursor-pointer hover:shadow-md hover:scale-105 transform" : ""
    )}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={cn(
        "p-3 rounded-xl",
        color === 'emerald' ? 'bg-emerald-100' :
        color === 'blue' ? 'bg-blue-100' :
        color === 'orange' ? 'bg-orange-100' :
        color === 'pink' ? 'bg-pink-100' :
        color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
      )}>
        <Icon className={cn(
          "h-6 w-6",
          color === 'emerald' ? 'text-emerald-600' :
          color === 'blue' ? 'text-blue-600' :
          color === 'orange' ? 'text-orange-600' :
          color === 'pink' ? 'text-pink-600' :
          color === 'purple' ? 'text-purple-600' : 'text-gray-600'
        )} />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className={cn(
              "ml-2 text-sm font-semibold px-2 py-1 rounded-full",
              trend > 0 ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const Header = ({ onProfileClick }) => {
  const { user, logout } = useAuth();
  
  // Generate display name from firstName and lastName, fallback to name
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'User';
  
  // Generate avatar URL based on current name - always regenerate, don't cache
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff&t=${Date.now()}`;
  
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-2 rounded-xl shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  CuraOne
                </h1>
              </div>
            </div>
            <div className="ml-8">
              <h2 className="text-lg font-semibold text-gray-900">Wellness Dashboard</h2>
              <p className="text-sm text-gray-600">Welcome back, {displayName}</p>
            </div>
          </div>

            <div className="flex items-center space-x-4">
              <RealtimeStatus showDetailed={true} />
              <NotificationBell />

              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2">
              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
                title="View Profile"
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                  src={avatarUrl}
                  alt={displayName}
                />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                </div>
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const EnhancedPatientDashboard = () => {
  const [activeChart, setActiveChart] = useState('progress');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalMode, setBookingModalMode] = useState('create');
  const [wellnessModalOpen, setWellnessModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Real data states
  const [progressMetrics, setProgressMetrics] = useState({
    completedSessions: 0,
    totalSessions: 0,
    progressPercentage: 0,
    streak: 0,
    currentProgram: 'Loading...'
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [wellnessData, setWellnessData] = useState({
    energyLevel: 50,
    sleepQuality: 50,
    mood: 50,
    stressLevel: 50
  });
  const [progressData, setProgressData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Current'],
    energy: [50, 50, 50, 50, 50, 50, 50],
    sleep: [50, 50, 50, 50, 50, 50, 50],
    stress: [50, 50, 50, 50, 50, 50, 50]
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  
  // Fetch real data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardService = (await import('../../services/dashboardService.js')).default;
        
        // Fetch all dashboard data with individual error handling
        try {
          const progress = await dashboardService.getProgress();
          setProgressMetrics(progress);
        } catch (err) {
          console.error('Error fetching progress:', err);
        }
        
        try {
          const sessions = await dashboardService.getUpcomingSessions();
          setUpcomingSessions(sessions);
        } catch (err) {
          console.error('Error fetching sessions:', err);
        }
        
        try {
          const wellness = await dashboardService.getWellnessData();
          setWellnessData(wellness);
        } catch (err) {
          console.error('Error fetching wellness:', err);
        }
        
        try {
          const wellnessProgress = await dashboardService.getWellnessProgress();
          setProgressData(wellnessProgress);
        } catch (err) {
          console.error('Error fetching wellness progress:', err);
        }
      } catch (error) {
        console.error('Error loading dashboard service:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Mock therapies and practitioners data
  const availableTherapies = [
    {
      id: '1',
      name: 'Abhyanga (Full Body Oil Massage)',
      price: 120,
      duration: 60,
      category: 'massage',
      description: 'Traditional Ayurvedic full-body oil massage'
    },
    {
      id: '2', 
      name: 'Shirodhara (Oil Pouring Therapy)',
      price: 150,
      duration: 45,
      category: 'rejuvenation',
      description: 'Continuous stream of warm oil on the forehead'
    },
    {
      id: '3',
      name: 'Panchakarma Consultation', 
      price: 80,
      duration: 30,
      category: 'consultation',
      description: 'Comprehensive consultation for detox program'
    },
    {
      id: '4',
      name: 'Swedana (Steam Therapy)',
      price: 90,
      duration: 30,
      category: 'detox',
      description: 'Herbal steam therapy for detoxification'
    }
  ];

  const availablePractitioners = [
    {
      id: '1',
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      name: 'Dr. Sarah Smith',
      specialization: 'Panchakarma Specialist'
    },
    {
      id: '2', 
      firstName: 'Dr. Raj',
      lastName: 'Patel',
      name: 'Dr. Raj Patel',
      specialization: 'Ayurvedic Physician'
    },
    {
      id: '3',
      firstName: 'Dr. Maya',
      lastName: 'Sharma',
      name: 'Dr. Maya Sharma',
      specialization: 'Massage Therapist'
    }
  ];

  // Booking handlers
  const handleBookSession = () => {
    setSelectedBooking(null);
    setBookingModalMode('create');
    setBookingModalOpen(true);
  };

  const handleSaveBooking = async (bookingData) => {
    try {
      // In a real app, this would save to the backend
      console.log('Saving booking:', bookingData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookingModalOpen(false);
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  };

  const handleUpdateWellness = () => {
    setWellnessModalOpen(true);
  };

  const handleSaveWellness = async (wellnessData) => {
    try {
      // In a real app, this would save to the backend
      console.log('Saving wellness data:', wellnessData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWellnessModalOpen(false);
    } catch (error) {
      console.error('Error saving wellness data:', error);
      throw error;
    }
  };
  
  // Mock data for session and milestone charts (still using mock data for these)
  const sessionData = {
    labels: ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Meditation', 'Yoga Therapy'],
    completed: [8, 6, 4, 10, 7],
    remaining: [2, 4, 6, 2, 3]
  };

  const milestoneData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 8', 'Week 10'],
    target: [10, 20, 35, 50, 65, 75, 85, 100],
    actual: [12, 25, 38, 52, 68, 78, 85, 92]
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'progress':
        return <ProgressLineChart data={progressData} />;
      case 'sessions':
        return <SessionProgressChart data={sessionData} />;
      case 'wellness':
        return <WellnessMetricsChart data={wellnessData} />;
      case 'milestones':
        return <RecoveryMilestonesChart milestones={milestoneData} />;
      default:
        return <ProgressLineChart data={progressData} />;
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header onProfileClick={() => setProfileModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Treatment Progress"
            value={`${progressMetrics.progressPercentage}%`}
            subtitle={`${progressMetrics.completedSessions}/${progressMetrics.totalSessions} sessions`}
            icon={TrendingUp}
            color="emerald"
            trend={15}
            onClick={() => setActiveChart('progress')}
          />
          <StatCard
            title="Current Streak"
            value={`${progressMetrics.streak} days`}
            subtitle="Consecutive sessions"
            icon={Award}
            color="purple"
            trend={8}
          />
          <StatCard
            title="Next Session"
            value="Today"
            subtitle="Abhyanga - 10:00 AM"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Wellness Score"
            value="87%"
            subtitle="Above average"
            icon={Heart}
            color="pink"
            trend={12}
            onClick={() => setActiveChart('wellness')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Analytics & Progress</h2>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Interactive Charts</span>
                  </div>
                </div>
                
                {/* Chart Navigation */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'progress', label: 'Progress Trends', icon: TrendingUp },
                    { key: 'sessions', label: 'Session Analysis', icon: Activity },
                    { key: 'wellness', label: 'Wellness Metrics', icon: Heart },
                    { key: 'milestones', label: 'Recovery Goals', icon: Target }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveChart(key)}
                      className={cn(
                        "inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        activeChart === key
                          ? "bg-blue-100 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                {renderChart()}
              </div>
            </div>

            {/* Enhanced Sessions List */}
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <button 
                    onClick={handleBookSession}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Session
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div 
                      key={session.id} 
                      className={cn(
                        "flex items-center p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200",
                        index === 0 ? "border-l-emerald-500 bg-emerald-50" : "border-l-blue-500 bg-blue-50"
                      )}
                    >
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                          index === 0 ? "bg-emerald-100" : "bg-blue-100"
                        )}>
                          <Calendar className={cn(
                            "h-6 w-6",
                            index === 0 ? "text-emerald-600" : "text-blue-600"
                          )} />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-semibold text-gray-900">{session.therapy}</h3>
                        <p className="text-sm text-gray-600">with {session.practitioner}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm font-medium text-gray-700">
                            {session.date} at {session.time}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{session.duration} min</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{session.location}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                          session.status === 'confirmed' ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"
                        )}>
                          {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { 
                    icon: Calendar, 
                    label: 'Book New Session', 
                    color: 'text-blue-600', 
                    bg: 'hover:bg-blue-50',
                    onClick: handleBookSession
                  },
                  { 
                    icon: Heart, 
                    label: 'Update Wellness Goals', 
                    color: 'text-emerald-600', 
                    bg: 'hover:bg-emerald-50',
                    onClick: () => toast.info('Wellness goals feature coming soon!')
                  },
                  { 
                    icon: Activity, 
                    label: 'Log Daily Symptoms', 
                    color: 'text-orange-600', 
                    bg: 'hover:bg-orange-50',
                    onClick: () => toast.info('Symptom logging feature coming soon!')
                  },
                  { 
                    icon: Zap, 
                    label: 'Emergency Consultation', 
                    color: 'text-red-600', 
                    bg: 'hover:bg-red-50',
                    onClick: () => toast.warning('For emergencies, please call +1-555-EMERGENCY')
                  }
                ].map(({ icon: Icon, label, color, bg, onClick }) => (
                  <button 
                    key={label} 
                    onClick={onClick}
                    className={cn(
                      "w-full text-left flex items-center p-3 rounded-lg transition-all duration-200 transform hover:scale-105",
                      bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mr-3", color)} />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Wellness Check */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <h2 className="text-lg font-bold text-gray-900">Today's Check-in</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { metric: 'Energy Level', value: wellnessData.energyLevel, color: 'emerald' },
                    { metric: 'Sleep Quality', value: wellnessData.sleepQuality, color: 'blue' },
                    { metric: 'Mood', value: wellnessData.mood, color: 'purple' },
                    { metric: 'Stress Level', value: wellnessData.stressLevel, color: 'red', inverted: true }
                  ].map(({ metric, value, color, inverted }) => (
                    <div key={metric} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{metric}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-500",
                              color === 'emerald' ? 'bg-emerald-500' :
                              color === 'blue' ? 'bg-blue-500' :
                              color === 'purple' ? 'bg-purple-500' :
                              color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                            )}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          inverted && value < 50 ? 'text-emerald-600' : 
                          inverted ? 'text-red-600' :
                          value >= 80 ? 'text-emerald-600' :
                          value >= 60 ? 'text-orange-600' : 'text-red-600'
                        )}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={handleUpdateWellness}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Update Check-in
                  </button>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h2 className="text-lg font-bold text-gray-900">Recent Achievements</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { icon: Award, title: '12-Day Streak', desc: 'Consistent daily check-ins', color: 'text-yellow-600' },
                    { icon: Target, title: 'Wellness Goal', desc: '85% stress reduction achieved', color: 'text-emerald-600' },
                    { icon: Activity, title: 'Session Milestone', desc: '35 therapy sessions completed', color: 'text-blue-600' }
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={cn("h-5 w-5", color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-600">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        booking={selectedBooking}
        onSave={handleSaveBooking}
        mode={bookingModalMode}
        availableTherapies={availableTherapies}
        availablePractitioners={availablePractitioners}
        currentUser={user}
      />

      {/* Wellness Check-in Modal */}
      <WellnessModal
        isOpen={wellnessModalOpen}
        onClose={() => setWellnessModalOpen(false)}
        onSave={handleSaveWellness}
        currentUser={user}
      />

      {/* Patient Profile Modal */}
      <PatientProfileView
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};