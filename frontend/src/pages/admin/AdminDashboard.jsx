import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Settings,
  Bell,
  MessageSquare,
  DollarSign,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import toast from '../../utils/toast';
import { NotificationBell, NotificationProvider } from '../../components/notifications/NotificationSystem';
import TherapyModal from '../../components/modals/TherapyModal';
import RealtimeStatus from '../../components/realtime/RealtimeStatus';
import PatientManagement from '../../components/PatientManagement';
import AdvancedSearchFilter, { filterConfigs } from '../../components/common/AdvancedSearchFilter';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalTherapies: 0,
    revenue: 0,
    pendingBookings: 0,
    activeUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'CuraOne Platform',
    supportEmail: 'support@curaone.com',
    sessionDuration: 60,
    bookingWindow: 30,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    currency: 'USD',
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordRequirements: true
  });
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [therapyModalOpen, setTherapyModalOpen] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [therapyModalMode, setTherapyModalMode] = useState('create');

  // Advanced filtering states
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingFilters, setBookingFilters] = useState({
    status: [],
    dateRange: { from: '', to: '' },
    therapy: '',
    practitioner: '',
    priceRange: { min: '', max: '' }
  });
  const [therapySearchTerm, setTherapySearchTerm] = useState('');
  const [therapyFilters, setTherapyFilters] = useState({
    category: [],
    duration: { min: '', max: '' },
    price: { min: '', max: '' },
    status: '',
    tags: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentBookings(),
        loadUsers(),
        loadTherapies(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // Mock stats - in real app would come from API
    setStats({
      totalUsers: 156,
      totalBookings: 89,
      totalTherapies: 12,
      revenue: 15680,
      pendingBookings: 7,
      activeUsers: 23
    });
  };

  const loadRecentBookings = async () => {
    // Mock recent bookings - in real app would fetch from API
    setRecentBookings([
      {
        id: '1',
        patient: { name: 'John Doe', email: 'john@example.com' },
        therapy: { name: 'Abhyanga' },
        practitioner: { name: 'Dr. Sarah Smith' },
        date: '2024-01-20',
        time: '10:00',
        status: 'confirmed',
        amount: 120
      },
      {
        id: '2',
        patient: { name: 'Jane Smith', email: 'jane@example.com' },
        therapy: { name: 'Shirodhara' },
        practitioner: { name: 'Dr. Michael Johnson' },
        date: '2024-01-21',
        time: '14:30',
        status: 'pending',
        amount: 150
      },
      {
        id: '3',
        patient: { name: 'Mike Wilson', email: 'mike@example.com' },
        therapy: { name: 'Panchakarma' },
        practitioner: { name: 'Dr. Sarah Smith' },
        date: '2024-01-22',
        time: '09:00',
        status: 'completed',
        amount: 300
      }
    ]);
  };

  const loadUsers = async () => {
    // Mock users - in real app would fetch from API
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'patient',
        status: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        name: 'Dr. Sarah Smith',
        email: 'sarah@example.com',
        role: 'practitioner',
        status: 'active',
        joinDate: '2023-12-01',
        lastLogin: '2024-01-20'
      },
      {
        id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'patient',
        status: 'inactive',
        joinDate: '2024-01-10',
        lastLogin: '2024-01-18'
      }
    ]);
  };

  const loadTherapies = async () => {
    try {
      const response = await apiService.get('/therapies');
      if (response.success) {
        setTherapies(response.data.therapies);
      }
    } catch (error) {
      console.error('Error loading therapies:', error);
    }
  };

  const loadNotifications = async () => {
    // Mock notifications - in real app would fetch from API
    setNotifications([
      {
        id: '1',
        title: 'New Booking Request',
        message: 'John Doe has requested an Abhyanga session',
        type: 'booking',
        priority: 'normal',
        timestamp: '2024-01-20T10:30:00Z',
        isRead: false
      },
      {
        id: '2',
        title: 'System Update',
        message: 'Monthly backup completed successfully',
        type: 'system',
        priority: 'low',
        timestamp: '2024-01-20T02:00:00Z',
        isRead: true
      }
    ]);
  };

  // Event handlers for various actions
  const handleAddTherapy = () => {
    setSelectedTherapy(null);
    setTherapyModalMode('create');
    setTherapyModalOpen(true);
  };

  const handleEditTherapy = (therapy) => {
    setSelectedTherapy(therapy);
    setTherapyModalMode('edit');
    setTherapyModalOpen(true);
  };

  const handleDeleteTherapy = (therapy) => {
    if (window.confirm(`Are you sure you want to delete "${therapy.name}"? This action cannot be undone.`)) {
      const updatedTherapies = therapies.filter(t => t.id !== therapy.id);
      setTherapies(updatedTherapies);
      toast.success(`Therapy "${therapy.name}" deleted successfully!`);
    }
  };

  const handleSaveTherapy = async (therapyData) => {
    try {
      if (therapyData.id) {
        // Update existing therapy
        const updatedTherapies = therapies.map(t => 
          t.id === therapyData.id ? { ...therapyData } : t
        );
        setTherapies(updatedTherapies);
      } else {
        // Create new therapy
        const newTherapy = {
          ...therapyData,
          id: Date.now().toString(), // Simple ID generation for demo
          createdAt: new Date().toISOString()
        };
        setTherapies([...therapies, newTherapy]);
      }
      setTherapyModalOpen(false);
    } catch (error) {
      console.error('Error saving therapy:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleViewTherapy = (therapy) => {
    setSelectedTherapy(therapy);
    setTherapyModalMode('view');
    setTherapyModalOpen(true);
  };

  const handleExportBookings = () => {
    const csvData = recentBookings.map(booking => ({
      ID: booking.id,
      Patient: booking.patient.name,
      Email: booking.patient.email,
      Practitioner: booking.practitioner.name,
      Therapy: booking.therapy.name,
      Date: booking.date,
      Time: booking.time,
      Status: booking.status,
      Amount: booking.amount
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewBooking = (booking) => {
    toast.info(`Viewing booking details for ${booking.patient.name}. This would show full booking details in a modal.`);
  };

  const handleEditBooking = (booking) => {
    toast.info(`Editing booking for ${booking.patient.name}. This would open an edit form.`);
  };

  const handleConfirmBooking = (booking) => {
    const updatedBookings = recentBookings.map(b => 
      b.id === booking.id ? { ...b, status: 'confirmed' } : b
    );
    setRecentBookings(updatedBookings);
    toast.success(`Booking confirmed for ${booking.patient.name}!`);
  };

  const handleCancelBooking = (booking) => {
    if (window.confirm(`Are you sure you want to cancel the booking for ${booking.patient.name}?`)) {
      const updatedBookings = recentBookings.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      );
      setRecentBookings(updatedBookings);
      toast.success('Booking cancelled successfully!');
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    toast.success('Settings saved successfully!');
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRunBackup = () => {
    toast.info('Running system backup... This would trigger a real backup process.');
  };

  const handleViewUpdates = () => {
    toast.info('Showing system updates. This would display available updates and change logs.');
  };

  const handleViewSystemHealth = () => {
    toast.info('Displaying system health details. This would show server metrics, uptime, etc.');
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          change={15}
        />
        <StatCard
          title="Active Therapies"
          value={stats.totalTherapies}
          icon={Activity}
          color="bg-indigo-500"
          change={0}
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={AlertTriangle}
          color="bg-yellow-500"
          change={-5}
        />
        <StatCard
          title="Active Users Today"
          value={stats.activeUsers}
          icon={TrendingUp}
          color="bg-emerald-500"
          change={20}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{booking.patient.name}</p>
                    <p className="text-xs text-gray-500">{booking.therapy.name} - {booking.date} {booking.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">${booking.amount}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${!notification.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Bell className={`w-4 h-4 ${!notification.isRead ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize text-sm text-gray-900">{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTherapiesTab = () => {
    // Filter therapies based on search and filters
    const filteredTherapies = therapies.filter(therapy => {
      const searchLower = therapySearchTerm.toLowerCase();
      const matchesSearch = therapySearchTerm === '' ||
        therapy.name.toLowerCase().includes(searchLower) ||
        therapy.description.toLowerCase().includes(searchLower) ||
        therapy.category.toLowerCase().includes(searchLower);

      const matchesCategory = therapyFilters.category.length === 0 || therapyFilters.category.includes(therapy.category);
      const matchesStatus = !therapyFilters.status || therapy.isActive.toString() === (therapyFilters.status === 'active').toString();
      
      let matchesDuration = true;
      if (therapyFilters.duration.min && !isNaN(parseInt(therapyFilters.duration.min))) {
        matchesDuration = matchesDuration && therapy.duration >= parseInt(therapyFilters.duration.min);
      }
      if (therapyFilters.duration.max && !isNaN(parseInt(therapyFilters.duration.max))) {
        matchesDuration = matchesDuration && therapy.duration <= parseInt(therapyFilters.duration.max);
      }
      
      let matchesPrice = true;
      if (therapyFilters.price.min && !isNaN(parseInt(therapyFilters.price.min))) {
        matchesPrice = matchesPrice && therapy.price >= parseInt(therapyFilters.price.min);
      }
      if (therapyFilters.price.max && !isNaN(parseInt(therapyFilters.price.max))) {
        matchesPrice = matchesPrice && therapy.price <= parseInt(therapyFilters.price.max);
      }

      // Tags matching (if therapy has tags property)
      const matchesTags = therapyFilters.tags.length === 0 || (therapy.tags && therapyFilters.tags.some(tag => therapy.tags.includes(tag)));

      return matchesSearch && matchesCategory && matchesStatus && matchesDuration && matchesPrice && matchesTags;
    });

    return (
      <div className="space-y-6">
        {/* Advanced Search and Filters */}
        <AdvancedSearchFilter
          searchTerm={therapySearchTerm}
          onSearchChange={setTherapySearchTerm}
          filters={therapyFilters}
          onFiltersChange={setTherapyFilters}
          filterConfig={filterConfigs.therapies}
          resultsCount={filteredTherapies.length}
          totalCount={therapies.length}
          placeholder="Search therapies by name, description, or category..."
          customActions={[
            {
              label: 'Add Therapy',
              icon: Plus,
              onClick: handleAddTherapy,
              variant: 'primary'
            }
          ]}
        />

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Therapy Management</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapies.map((therapy) => (
            <div key={therapy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">{therapy.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  therapy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {therapy.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{therapy.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-900">{therapy.duration}min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="text-gray-900 font-medium">${therapy.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-900 capitalize">{therapy.category}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  onClick={() => handleViewTherapy(therapy)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-100 transition-colors"
                  title="View therapy details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditTherapy(therapy)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                  title="Edit therapy"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteTherapy(therapy)}
                  className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Delete therapy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingsTab = () => {
    // Filter bookings based on search and filters
    const filteredBookings = recentBookings.filter(booking => {
      const searchLower = bookingSearchTerm.toLowerCase();
      const matchesSearch = bookingSearchTerm === '' ||
        booking.patient.name.toLowerCase().includes(searchLower) ||
        booking.patient.email.toLowerCase().includes(searchLower) ||
        booking.practitioner.name.toLowerCase().includes(searchLower) ||
        booking.therapy.name.toLowerCase().includes(searchLower);

      const matchesStatus = bookingFilters.status.length === 0 || bookingFilters.status.includes(booking.status);
      const matchesTherapy = !bookingFilters.therapy || booking.therapy.name.toLowerCase() === bookingFilters.therapy;
      const matchesPractitioner = !bookingFilters.practitioner || booking.practitioner.name.toLowerCase().includes(bookingFilters.practitioner);
      
      let matchesPrice = true;
      if (bookingFilters.priceRange.min && !isNaN(parseInt(bookingFilters.priceRange.min))) {
        matchesPrice = matchesPrice && booking.amount >= parseInt(bookingFilters.priceRange.min);
      }
      if (bookingFilters.priceRange.max && !isNaN(parseInt(bookingFilters.priceRange.max))) {
        matchesPrice = matchesPrice && booking.amount <= parseInt(bookingFilters.priceRange.max);
      }

      let matchesDateRange = true;
      const bookingDate = new Date(booking.date);
      if (bookingFilters.dateRange.from) {
        const fromDate = new Date(bookingFilters.dateRange.from);
        matchesDateRange = matchesDateRange && bookingDate >= fromDate;
      }
      if (bookingFilters.dateRange.to) {
        const toDate = new Date(bookingFilters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && bookingDate <= toDate;
      }

      return matchesSearch && matchesStatus && matchesTherapy && matchesPractitioner && matchesPrice && matchesDateRange;
    });

    return (
      <div className="space-y-6">
        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="bg-blue-500"
            change={12}
          />
          <StatCard
            title="Pending"
            value={stats.pendingBookings}
            icon={AlertTriangle}
            color="bg-yellow-500"
            change={-5}
          />
          <StatCard
            title="Confirmed"
            value={recentBookings.filter(b => b.status === 'confirmed').length}
            icon={CheckCircle}
            color="bg-green-500"
            change={8}
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-500"
            change={15}
          />
        </div>

        {/* Advanced Search and Filters */}
        <AdvancedSearchFilter
          searchTerm={bookingSearchTerm}
          onSearchChange={setBookingSearchTerm}
          filters={bookingFilters}
          onFiltersChange={setBookingFilters}
          filterConfig={filterConfigs.bookings}
          resultsCount={filteredBookings.length}
          totalCount={recentBookings.length}
          placeholder="Search bookings by patient, practitioner, or therapy..."
          customActions={[
            {
              label: 'Export',
              icon: Download,
              onClick: handleExportBookings
            }
          ]}
        />

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
          </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Practitioner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.patient.name}</div>
                    <div className="text-sm text-gray-500">{booking.patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.practitioner.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.therapy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.date}</div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleViewBooking(booking)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View booking details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditBooking(booking)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit booking"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleConfirmBooking(booking)}
                        className="text-green-600 hover:text-green-900"
                        title="Confirm booking"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleCancelBooking(booking)}
                      className="text-red-600 hover:text-red-900"
                      title="Cancel booking"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          <p className="text-sm text-gray-500">Configure basic system settings and preferences</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleSettingChange('systemName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Session Duration (minutes)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60" selected>60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Window (days in advance)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="1"
                max="90"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          <p className="text-sm text-gray-500">Configure when and how notifications are sent</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Send booking confirmations and reminders via email</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-500">Send appointment reminders via SMS</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-500">Send real-time notifications to the web app</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Schedule (hours before appointment)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label className="ml-2 text-sm text-gray-700">24 hours</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label className="ml-2 text-sm text-gray-700">2 hours</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label className="ml-2 text-sm text-gray-700">30 minutes</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
          <p className="text-sm text-gray-500">Configure payment options and pricing</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="USD" selected>USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Methods
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Credit/Debit Cards</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 text-sm text-gray-700">PayPal</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Cash</label>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Requirement (%)
              </label>
              <input
                type="number"
                defaultValue="25"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Fee (%)
              </label>
              <input
                type="number"
                defaultValue="10"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No-show Fee (%)
              </label>
              <input
                type="number"
                defaultValue="50"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          <p className="text-sm text-gray-500">Configure security and access control settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Require 2FA for admin and practitioner accounts</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
              <p className="text-sm text-gray-500">Automatically log out inactive users</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="15">15 minutes</option>
              <option value="30" selected>30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password Requirements</h4>
              <p className="text-sm text-gray-500">Enforce strong password policies</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>
          <p className="text-sm text-gray-500">Backup, updates, and system health monitoring</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Last Backup</h4>
              <p className="text-sm text-gray-500 mb-4">2 hours ago</p>
              <button 
                onClick={handleRunBackup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Run Backup
              </button>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">System Updates</h4>
              <p className="text-sm text-gray-500 mb-4">1 update available</p>
              <button 
                onClick={handleViewUpdates}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                View Updates
              </button>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">System Health</h4>
              <p className="text-sm text-gray-500 mb-4">All systems operational</p>
              <button 
                onClick={handleViewSystemHealth}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end space-x-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'therapies', name: 'Therapies', icon: Activity },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'settings', name: 'Settings', icon: Settings }
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
                <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName || user?.name || 'Admin'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <RealtimeStatus showDetailed={true} />
              <NotificationBell />

              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2">
                <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(user?.firstName?.[0] || user?.name?.[0] || 'A').toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName || user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role || 'admin'}</p>
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
                      ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'patients' && <PatientManagement />}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'therapies' && renderTherapiesTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Therapy Management Modal */}
      <TherapyModal
        isOpen={therapyModalOpen}
        onClose={() => setTherapyModalOpen(false)}
        therapy={selectedTherapy}
        onSave={handleSaveTherapy}
        mode={therapyModalMode}
      />
      </div>
    </NotificationProvider>
  );
};

export default AdminDashboard;