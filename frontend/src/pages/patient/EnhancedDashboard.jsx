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
  User,
  Trash2,
  AlertTriangle,
  FileText,
  Eye,
  Printer,
  Pill,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
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
import ThemeToggle from '../../components/ui/ThemeToggle';
import { downloadPrescriptionPDF, viewPrescriptionPDF } from '../../components/prescriptions/PrescriptionPDFGenerator';
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

const Header = ({ onProfileClick, onDeleteAccount }) => {
  const { user, logout } = useAuth();
  
  // Generate display name from firstName and lastName, fallback to name
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'User';
  
  // Generate avatar URL based on current name - always regenerate, don't cache
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff&t=${Date.now()}`;
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Wellness Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {displayName}</p>
            </div>
          </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <RealtimeStatus showDetailed={true} />
              <NotificationBell />

              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-2 transition-colors">
              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1 transition-colors"
                title="View Profile"
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                  src={avatarUrl}
                  alt={displayName}
                />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button
                onClick={onDeleteAccount}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete Account"
              >
                <Trash2 className="h-4 w-4" />
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
  const [availablePractitioners, setAvailablePractitioners] = useState([]);
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [prescriptionsOpen, setPrescriptionsOpen] = useState(false);
  
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
          // Fetch real bookings instead of mock sessions
          const bookingsResponse = await apiService.get('/bookings/my-bookings');
          console.log('📦 Raw bookings response:', bookingsResponse);
          
          if (bookingsResponse.success && bookingsResponse.data?.bookings) {
            console.log('📋 All bookings:', bookingsResponse.data.bookings);
            
            // Filter for upcoming bookings with null checks
            const hiddenBookings = JSON.parse(localStorage.getItem('hiddenBookings') || '[]');
            const bookings = bookingsResponse.data.bookings.filter(b => {
              if (!b || !b.status || !b.scheduledDate) return false;
              if (hiddenBookings.includes(b.id)) return false;
              const validStatuses = ['scheduled', 'confirmed', 'cancelled'];
              return validStatuses.includes(b.status) && new Date(b.scheduledDate) >= new Date();
            });
            
            console.log('✅ Filtered bookings:', bookings);
            
            // Transform bookings to match UI expectations
            const upcoming = bookings.map(b => ({
              id: b.id,
              therapy: b.therapy?.name || 'Unknown Therapy',
              practitioner: b.practitioner ? `${b.practitioner.firstName} ${b.practitioner.lastName}` : 'Unknown Practitioner',
              date: b.scheduledDate,
              time: b.scheduledTime,
              duration: b.duration || 60,
              location: 'CuraOne Wellness Center',
              status: b.status
            }));
            
            console.log('✅ Loaded upcoming sessions:', upcoming);
            setUpcomingSessions(upcoming);
          }
        } catch (err) {
          console.error('Error fetching sessions:', err);
          setUpcomingSessions([]);
        }
        
        try {
          const wellness = await dashboardService.getWellnessData();
          setWellnessData(wellness);
        } catch (err) {
          console.error('Error fetching wellness:', err);
        }
        
        try {
          // Always load from real check-in history
          await refreshWellnessChart();
        } catch (err) {
          console.error('Error fetching wellness progress:', err);
        }      } catch (error) {
        console.error('Error loading dashboard service:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Fetch practitioners from API
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const response = await apiService.get('/practitioners');
        if (response.success) {
          const practitioners = response.data.practitioners.map(p => ({
            ...p,
            name: `${p.firstName} ${p.lastName}`
          }));
          console.log('✅ Loaded practitioners:', practitioners);
          setAvailablePractitioners(practitioners);
        }
      } catch (error) {
        console.error('❌ Error loading practitioners:', error);
        setAvailablePractitioners([]);
      }
    };
    
    fetchPractitioners();
  }, []);

  // Fetch therapies from API
  useEffect(() => {
    const fetchTherapies = async () => {
      try {
        const response = await apiService.get('/therapies');
        if (response.success) {
          console.log('✅ Loaded therapies:', response.data.therapies);
          setAvailableTherapies(response.data.therapies);
        }
      } catch (error) {
        console.error('❌ Error loading therapies:', error);
        setAvailableTherapies([]);
      }
    };
    
    fetchTherapies();
  }, []);

  // Booking handlers
  const handleBookSession = () => {
    setSelectedBooking(null);
    setBookingModalMode('create');
    setBookingModalOpen(true);
  };

  const handleSaveBooking = async (bookingData) => {
    try {
      console.log('Saving booking:', bookingData);
      
      // Create booking via API
      const response = await apiService.post('/bookings', {
        therapyId: bookingData.therapy?.id,
        practitionerId: bookingData.practitioner?.id,
        preferredDate: bookingData.scheduledDate,
        preferredTime: bookingData.scheduledTime,
        duration: bookingData.duration,
        notes: bookingData.notes || ''
      });
      
      if (response.success) {
        console.log('✅ Booking created:', response.data?.booking);
        
        // Refresh upcoming sessions
        try {
          const bookingsResponse = await apiService.get('/bookings/my-bookings');
          if (bookingsResponse.success && bookingsResponse.data?.bookings) {
            const upcoming = bookingsResponse.data.bookings.filter(b => 
              b && b.status && (b.status === 'scheduled' || b.status === 'confirmed') &&
              b.scheduledDate && new Date(b.scheduledDate) >= new Date()
            );
            setUpcomingSessions(upcoming);
          }
        } catch (fetchError) {
          console.error('Error fetching updated bookings:', fetchError);
          // Don't throw - booking was created successfully
        }
        
        setBookingModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  };

  const handleCancelBooking = async (sessionId) => {
    const session = upcomingSessions.find(s => s.id === sessionId);
    const isCancelled = session?.status === 'cancelled';
    
    const confirmMsg = isCancelled 
      ? 'Remove this rejected booking from your list?' 
      : 'Are you sure you want to cancel this booking?';
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      if (!isCancelled) {
        await apiService.put(`/bookings/${sessionId}/cancel`, { reason: 'Cancelled by patient' });
      }
      // Store hidden booking IDs in localStorage so they don't reappear
      const hidden = JSON.parse(localStorage.getItem('hiddenBookings') || '[]');
      if (!hidden.includes(sessionId)) {
        hidden.push(sessionId);
        localStorage.setItem('hiddenBookings', JSON.stringify(hidden));
      }
      setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const response = await apiService.delete('/auth/delete-account', { password: deletePassword });
      if (response.success) {
        localStorage.clear();
        logout();
      }
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account. Check your password.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateWellness = () => {
    setWellnessModalOpen(true);
  };

  const handleSaveWellness = async (wellnessData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Helper: convert 0-100 slider to 1-10 integer
      const toScale = (v) => Math.max(1, Math.min(10, Math.round(Number(v) / 10)));
      
      const metrics = [
        { type: 'energy', value: toScale(wellnessData.energyLevel) },
        { type: 'sleep',  value: toScale(wellnessData.sleepQuality) },
        { type: 'mood',   value: toScale(wellnessData.moodLevel) },
        { type: 'stress', value: toScale(wellnessData.stressLevel) }
      ];
      
      const payload = {
        metrics,
        energyLevel: toScale(wellnessData.energyLevel),
        stressLevel: toScale(wellnessData.stressLevel),
        sleepHours: wellnessData.sleepHours || 7,
        mood: wellnessData.moodLevel >= 70 ? 'good' : wellnessData.moodLevel >= 40 ? 'neutral' : 'poor',
        notes: wellnessData.notes || ''
      };
      
      // Check if today's check-in exists
      const historyRes = await apiService.get('/wellness/history?limit=7');
      const todayCheckIn = historyRes.data?.checkIns?.find(c => c.date === today);
      
      if (todayCheckIn) {
        await apiService.put(`/wellness/checkin/${todayCheckIn.id}`, payload);
      } else {
        await apiService.post('/wellness/checkin', payload);
      }
      
      // Update today's wellness display
      setWellnessData({
        energyLevel: wellnessData.energyLevel,
        sleepQuality: wellnessData.sleepQuality,
        mood: wellnessData.moodLevel,
        stressLevel: wellnessData.stressLevel
      });
      
      // Refresh chart with updated data
      await refreshWellnessChart();
      
      setWellnessModalOpen(false);
    } catch (error) {
      console.error('Error saving wellness data:', error);
      throw error;
    }
  };

  // Refresh wellness chart from real check-in history
  const refreshWellnessChart = async () => {
    try {
      const response = await apiService.get('/wellness/history?limit=42');
      if (!response.success || !response.data?.checkIns?.length) {
        // No check-in data yet - keep default 50% flat line
        return;
      }
      
      const checkIns = response.data.checkIns.sort((a, b) => new Date(a.date) - new Date(b.date));
      const now = new Date();
      
      // Group by week (0 = current week, 1 = last week, etc.)
      const weeklyData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
      
      checkIns.forEach(c => {
        const date = new Date(c.date);
        const daysAgo = Math.floor((now - date) / (24 * 60 * 60 * 1000));
        const weekNum = Math.floor(daysAgo / 7);
        if (weekNum >= 0 && weekNum <= 5) {
          weeklyData[weekNum].push(c);
        }
      });
      
      const avg = (arr, field) => {
        const vals = arr.map(c => {
          if (field === 'energy') return (c.energyLevel || 0) * 10;
          if (field === 'sleep') return c.sleepQuality || 50;
          if (field === 'stress') return (c.stressLevel || 0) * 10;
          return 50;
        }).filter(v => v > 0);
        return vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 50;
      };
      
      // Labels: Week 6 (oldest) to Current (newest)
      const labels = ['Week 6', 'Week 5', 'Week 4', 'Week 3', 'Week 2', 'Week 1', 'Current'];
      const weekMap = [5, 4, 3, 2, 1, 0]; // maps label index to weeklyData key
      
      setProgressData({
        labels,
        energy: [...weekMap.map(w => avg(weeklyData[w], 'energy')), avg(weeklyData[0], 'energy')],
        sleep:  [...weekMap.map(w => avg(weeklyData[w], 'sleep')),  avg(weeklyData[0], 'sleep')],
        stress: [...weekMap.map(w => avg(weeklyData[w], 'stress')), avg(weeklyData[0], 'stress')]
      });
      
    } catch (err) {
      console.error('Error refreshing wellness chart:', err);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header onProfileClick={() => setProfileModalOpen(true)} onDeleteAccount={() => setDeleteAccountOpen(true)} />
      
      {/* Delete Account Modal */}
      {deleteAccountOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Your account, bookings, and all data will be permanently deleted. 
              Enter your password to confirm.
            </p>
            
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteAccountOpen(false); setDeletePassword(''); setDeleteError(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No upcoming sessions</p>
                      <p className="text-sm text-gray-400 mt-1">Book a session to get started</p>
                    </div>
                  ) : (
                    upcomingSessions.map((session, index) => (
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
                      <div className="ml-4 flex items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                          session.status === 'confirmed' ? "bg-emerald-100 text-emerald-800" : 
                          session.status === 'cancelled' ? "bg-red-100 text-red-800" :
                          session.status === 'completed' ? "bg-gray-100 text-gray-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {session.status === 'confirmed' ? '✓ Confirmed' : 
                           session.status === 'cancelled' ? '✗ Rejected' :
                           session.status === 'completed' ? 'Completed' :
                           'Pending'}
                        </span>
                        {session.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelBooking(session.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        )}
                      </div>
                    </div>
                  ))
                  )}
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
                    icon: FileText, 
                    label: 'My Prescriptions', 
                    color: 'text-purple-600', 
                    bg: 'hover:bg-purple-50',
                    onClick: () => setPrescriptionsOpen(true)
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

      {/* Prescriptions Modal */}
      {prescriptionsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">My Prescriptions</h2>
              </div>
              <button onClick={() => setPrescriptionsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-400 rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <PrescriptionsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Prescriptions Panel ──────────────────────────────────────────────────────
function PrescriptionsPanel() {
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState(null);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch(`/api/prescriptions/my?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setPrescriptions(d.data?.prescriptions || []))
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(p => p.status === filter);

  const handlePrint = (p) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Prescription</title><style>
      body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
      h1{color:#059669}.med{background:#f0fdf4;padding:12px;border-radius:8px;margin:8px 0;border-left:4px solid #059669}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
      .box{background:#f9fafb;padding:12px;border-radius:8px}label{font-weight:bold;display:block;margin-bottom:4px}
    </style></head><body>
      <h1>CuraOne - E-Prescription</h1>
      <div class="grid">
        <div class="box"><label>Patient</label>${p.patientName}</div>
        <div class="box"><label>Practitioner</label>${p.practitionerName}</div>
        <div class="box"><label>Date</label>${new Date(p.createdAt).toLocaleDateString()}</div>
        <div class="box"><label>Duration</label>${p.duration}</div>
      </div>
      <div class="box" style="margin-bottom:16px"><label>Diagnosis</label>${p.diagnosis}</div>
      <h3>Medications</h3>
      ${p.medications.map(m => `<div class="med"><strong>${m.name}</strong><br/>Dosage: ${m.dosage} | Frequency: ${m.frequency}${m.instructions ? `<br/>Instructions: ${m.instructions}` : ''}</div>`).join('')}
      ${p.instructions ? `<div class="box" style="margin-top:16px;border-left:4px solid #f59e0b"><label>Special Instructions</label>${p.instructions}</div>` : ''}
    </body></html>`);
    w.document.close(); w.print();
  };

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <span className="text-sm text-gray-500">{filtered.length} prescription(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No prescriptions found</p>
          <p className="text-sm text-gray-400 mt-1">Your practitioner will add prescriptions after your session</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{p.diagnosis}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.practitionerName}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration}</span>
                    <span className="flex items-center gap-1"><Pill className="w-3 h-3" />{p.medications?.length || 0} medication(s)</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => setSelected(p)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => viewPrescriptionPDF(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View PDF">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => downloadPrescriptionPDF(p)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handlePrint(p)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Prescription Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Diagnosis', selected.diagnosis], ['Duration', selected.duration], ['Practitioner', selected.practitionerName], ['Date', new Date(selected.createdAt).toLocaleDateString()]].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">{l}</p><p className="text-sm font-medium text-gray-900">{v}</p></div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Medications</h4>
                {selected.medications?.map((m, i) => (
                  <div key={i} className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-lg mb-2">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-600">Dosage: {m.dosage} | Frequency: {m.frequency}</p>
                    {m.instructions && <p className="text-sm text-gray-600">Instructions: {m.instructions}</p>}
                  </div>
                ))}
              </div>
              {selected.instructions && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 mb-1">Special Instructions</p>
                  <p className="text-sm text-gray-700">{selected.instructions}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Close</button>
                <button onClick={() => downloadPrescriptionPDF(selected)} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={() => handlePrint(selected)} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
