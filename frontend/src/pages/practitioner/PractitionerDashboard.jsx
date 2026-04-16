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
  Leaf,
  Trash2,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/bookingService';
import apiService from '../../services/api';
import PrescriptionForm from './PrescriptionForm';
import PrescriptionManagement from '../../components/prescriptions/PrescriptionManagement';
import { NotificationBell, NotificationProvider } from '../../components/notifications/NotificationSystem';
import ThemeToggle from '../../components/ui/ThemeToggle';

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
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await loadBookings();
      // Load stats and today's bookings after bookings are loaded
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats and today's bookings when bookings change
  useEffect(() => {
    loadStats();
    loadTodayBookings();
  }, [bookings]);

  const loadBookings = async () => {
    try {
      // Fetch real bookings from API
      const response = await bookingService.getMyBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    }
  };

  const loadTodayBookings = async () => {
    const today = new Date().toISOString().split('T')[0];
    // Filter bookings for today with null checks
    const todaysBookings = bookings.filter(booking => booking && booking.scheduledDate === today);
    setTodayBookings(todaysBookings);
  };

  const loadStats = async () => {
    // Calculate stats from real bookings with null checks
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);
    
    const todayCount = bookings.filter(b => b && b.scheduledDate === today).length;
    const weekCount = bookings.filter(b => b && b.scheduledDate && new Date(b.scheduledDate) <= thisWeek).length;
    const pendingCount = bookings.filter(b => b && (b.status === 'pending' || b.status === 'scheduled')).length;
    const completedCount = bookings.filter(b => b && b.status === 'completed').length;
    
    setStats({
      todayAppointments: todayCount,
      thisWeekAppointments: weekCount,
      pendingBookings: pendingCount,
      completedSessions: completedCount,
      averageRating: 4.8,
      totalPatients: new Set(bookings.map(b => b.patientId)).size
    });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Please enter your password'); return; }
    setDeleteLoading(true); setDeleteError('');
    try {
      const response = await apiService.delete('/auth/delete-account', { password: deletePassword });
      if (response.success) { localStorage.clear(); logout(); }
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account. Check your password.');
    } finally { setDeleteLoading(false); }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'confirm') {
        await bookingService.confirmBooking(bookingId);
      } else if (action === 'reject') {
        await bookingService.cancelBooking(bookingId, 'Rejected by practitioner');
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
      scheduled: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'scheduled' ? 'Pending' : status.replace('-', ' ')}
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
                      src={booking.patient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.patient?.firstName || 'User')}`}
                      alt={`${booking.patient?.firstName || ''} ${booking.patient?.lastName || ''}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {booking.patient?.firstName} {booking.patient?.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.therapy?.name} • {booking.scheduledTime} • {booking.duration}min
                      </p>
                      {booking.notes && (
                        <p className="text-xs text-gray-400 mt-1">{booking.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(booking.status)}
                    <div className="flex space-x-2">
                      {(booking.status === 'pending' || booking.status === 'scheduled') && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'scheduled') && (
                        <button
                          onClick={() => {
                            if (window.confirm('Reject this booking?')) {
                              handleBookingAction(booking.id, 'reject');
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reject
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
            {bookings.filter(booking => booking && booking.patient).map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={booking.patient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.patient?.firstName || 'User')}`}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.patient?.firstName} {booking.patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.patient?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.therapy?.name || 'N/A'}</div>
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
                  {(booking.status === 'pending' || booking.status === 'scheduled') && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      className="text-green-600 hover:text-green-900"
                      title="Confirm booking"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'scheduled') && (
                    <button
                      onClick={() => {
                        if (window.confirm('Reject this booking?')) {
                          handleBookingAction(booking.id, 'reject');
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Reject booking"
                    >
                      <XCircle className="w-4 h-4" />
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
    { id: 'prescriptions', name: 'Prescriptions', icon: FileText },
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Practitioner Dashboard</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName || user?.name || 'Doctor'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell />

              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-2 transition-colors">
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(user?.firstName?.[0] || user?.name?.[0] || 'D').toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.firstName || user?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role || 'practitioner'}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setDeleteAccountOpen(true)}
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
              Your practitioner account and all associated data will be permanently deleted.
              Enter your password to confirm.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
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

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors">
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
        {activeTab === 'patients' && <PatientManagementTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
        {activeTab === 'prescriptions' && <PrescriptionManagement />}
      </div>
      </div>
    </NotificationProvider>
  );
};

// ─── Patient Management Tab ───────────────────────────────────────────────────
const PatientManagementTab = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/patients', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(r => r.json())
      .then(data => setPatients(data.data || []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search patients by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700"
        />
        <span className="text-xs text-gray-400">{filtered.length} patients</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No patients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Contact', 'Constitution', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(p => (
                <tr key={p.id || p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {(p.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{p.phone || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 capitalize">
                      {p.constitution || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Patient Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(selected.firstName?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">{selected.firstName} {selected.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{selected.role}</p>
                </div>
              </div>
              {[
                { icon: Mail, label: 'Email', value: selected.email },
                { icon: Phone, label: 'Phone', value: selected.phone || '—' },
                { icon: MapPin, label: 'Address', value: selected.address || '—' },
                { icon: Activity, label: 'Constitution', value: selected.constitution || 'Not assessed' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
              {selected.medicalHistory && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Medical History</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{selected.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Feedback Tab ─────────────────────────────────────────────────────────────
const FeedbackTab = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(r => r.json())
      .then(data => setFeedback(data.data?.feedback || []))
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false));
  }, []);

  const avg = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—';

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: feedback.length },
          { label: 'Average Rating', value: `${avg} / 5` },
          { label: 'Recommend Rate', value: feedback.length ? `${Math.round(feedback.filter(f => f.wouldRecommend).length / feedback.length * 100)}%` : '—' }
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg shadow p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {feedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No feedback received yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map(f => (
            <div key={f.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 text-sm">
                  {f.patient?.firstName || 'Patient'} {f.patient?.lastName || ''}
                </p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              {f.comment && <p className="text-sm text-gray-600">{f.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PractitionerDashboard;