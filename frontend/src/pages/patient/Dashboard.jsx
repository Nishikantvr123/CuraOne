import React from 'react';
import { Calendar, Activity, Heart, Clock, Plus, TrendingUp, Bell, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center">
      <div className={cn("p-2 rounded-md", `bg-${color}-100`)}>
        <Icon className={cn("h-5 w-5", `text-${color}-600`)} />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <span className={cn(
              "ml-2 text-sm font-medium",
              trend > 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">AyurSutra</h1>
              </div>
            </div>
            <div className="ml-8">
              <h2 className="text-lg font-medium text-gray-900">Patient Dashboard</h2>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            <div className="flex items-center space-x-3">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0ea5e9&color=fff`}
                alt={user?.name}
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500"
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

export const PatientDashboard = () => {
  // Mock data
  const upcomingSessions = [
    {
      id: '1',
      therapy: 'Abhyanga (Oil Massage)',
      date: '2024-03-20',
      time: '10:00 AM',
      practitioner: 'Dr. Sarah Smith',
      duration: 60,
    },
    {
      id: '2',
      therapy: 'Shirodhara',
      date: '2024-03-22',
      time: '2:30 PM',
      practitioner: 'Dr. Sarah Smith',
      duration: 45,
    },
  ];

  const progressMetrics = {
    completedSessions: 12,
    totalSessions: 20,
    currentProgram: 'Detox & Rejuvenation',
    progressPercentage: 60,
  };

  const wellnessMetrics = [
    { name: 'Energy Level', value: 85, change: 12 },
    { name: 'Stress Level', value: 35, change: -20 },
    { name: 'Sleep Quality', value: 78, change: 15 },
    { name: 'Overall Mood', value: 82, change: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Completed Sessions"
            value={`${progressMetrics.completedSessions}/${progressMetrics.totalSessions}`}
            subtitle="Current program"
            icon={Activity}
            color="emerald"
          />
          <StatCard
            title="Progress"
            value={`${progressMetrics.progressPercentage}%`}
            subtitle={progressMetrics.currentProgram}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Next Session"
            value="Mar 20"
            subtitle="10:00 AM"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Overall Wellness"
            value="82%"
            subtitle="This week"
            icon={Heart}
            color="pink"
            trend={8}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Session
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center p-4 border border-gray-100 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{session.therapy}</h3>
                        <p className="text-sm text-gray-500">with {session.practitioner}</p>
                        <p className="text-sm text-gray-500">
                          {session.date} at {session.time} • {session.duration} min
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Treatment Progress</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{progressMetrics.currentProgram}</span>
                    <span>{progressMetrics.completedSessions} of {progressMetrics.totalSessions} sessions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressMetrics.progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {wellnessMetrics.map((metric) => (
                    <div key={metric.name} className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">{metric.value}%</div>
                      <div className="text-sm text-gray-500">{metric.name}</div>
                      <div className={cn(
                        "text-xs font-medium",
                        metric.change > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full text-left flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Book New Session</span>
                </button>
                <button className="w-full text-left flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Update Wellness Goals</span>
                </button>
                <button className="w-full text-left flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
                  <Activity className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Log Daily Symptoms</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Completed Abhyanga session</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Updated wellness goals</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};