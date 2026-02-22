import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Bell,
  Star,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/bookingService';
import { NotificationBell, NotificationProvider } from '../../components/notifications/NotificationSystem';

const PractitionerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    thisWeekAppointments: 0,
    pendingBookings: 0,
    completedSessions: 0,
    averageRating: 0,
    totalPatients: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadBookings(),
        loadStats(),
        loadTodayBookings()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      // Mock bookings - in real app would fetch from API
      setBookings([
        {
          id: '1',
          patient: { 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john@example.com',
            phone: '+1-555-0123',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=059669&color=fff'
          },
          therapy: { name: 'Abhyanga', duration: 60 },
          scheduledDate: '2024-01-20',
          scheduledTime: '10:00',
          status: 'confirmed',
          notes: 'First time patient, mild back pain',
          duration: 60
        },
        {
          id: '2',
          patient: { 
            firstName: 'Jane', 
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '+1-555-0124',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=0284c7&color=fff'
          },
          therapy: { name: 'Shirodhara', duration: 45 },
          scheduledDate: '2024-01-20',
          scheduledTime: '14:30',
          status: 'pending',
          notes: 'Regular patient, stress management',
          duration: 45
        },
        {
          id: '3',
          patient: { 
            firstName: 'Mike', 
            lastName: 'Wilson',
            email: 'mike@example.com',
            phone: '+1-555-0125',
            avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson&background=7c3aed&color=fff'
          },
          therapy: { name: 'Panchakarma', duration: 90 },
          scheduledDate: '2024-01-21',
          scheduledTime: '09:00',
          status: 'completed',
          notes: 'Complete detox program - week 2',
          duration: 90
        }
      ]);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadTodayBookings = async () => {
    const today = new Date().toISOString().split('T')[0];
    // Filter bookings for today
    const todaysBookings = bookings.filter(booking => booking.scheduledDate === today);
    setTodayBookings(todaysBookings);
  };

  const loadStats = async () => {
    // Mock stats - in real app would come from API
    setStats({
      todayAppointments: 3,
      thisWeekAppointments: 12,
      pendingBookings: 2,
      completedSessions: 45,
      averageRating: 4.8,
      totalPatients: 28
    });
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'confirm') {
        await bookingService.confirmBooking(bookingId);
      } else if (action === 'complete') {
        await bookingService.updateBooking(bookingId, { status: 'completed' });
      }
      // Reload data after action
      loadDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="bg-blue-500"
          subtitle="3 confirmed, 1 pending"
        />
        <StatCard
          title="This Week"
          value={stats.thisWeekAppointments}
          icon={Clock}
          color="bg-green-500"
          subtitle="12 total appointments"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingBookings}
          icon={AlertTriangle}
          color="bg-yellow-500"
          subtitle="Awaiting confirmation"
        />
        <StatCard
          title="Completed Sessions"
          value={stats.completedSessions}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="This month"
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating}/5`}
          icon={Star}
          color="bg-purple-500"
          subtitle="Based on patient feedback"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="bg-indigo-500"
          subtitle="Active patients"
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {todayBookings.length > 0 ? (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={booking.patient.avatar}
                      alt={`${booking.patient.firstName} ${booking.patient.lastName}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {booking.patient.firstName} {booking.patient.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.therapy.name} • {booking.scheduledTime} • {booking.duration}min
                      </p>
                      {booking.notes && (
                        <p className="text-xs text-gray-400 mt-1">{booking.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(booking.status)}
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'complete')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Complete
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppointmentsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">All Appointments</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Therapy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={booking.patient.avatar}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.patient.firstName} {booking.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.patient.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.therapy.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">{booking.scheduledTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.duration} mins
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h2 className="text-lg font-semibold text-gray-900">Practitioner Dashboard</h2>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName || user?.name || 'Doctor'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />

              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2">
                <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(user?.firstName?.[0] || user?.name?.[0] || 'D').toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName || user?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role || 'practitioner'}</p>
                </div>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Management</h3>
            <p className="text-gray-600">Patient management interface coming soon...</p>
          </div>
        )}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Feedback</h3>
            <p className="text-gray-600">Feedback management interface coming soon...</p>
          </div>
        )}
      </div>
      </div>
    </NotificationProvider>
  );
};

export default PractitionerDashboard;