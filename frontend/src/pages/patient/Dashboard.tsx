import React from 'react';
import { Calendar, Activity, Heart, Clock, Plus, TrendingUp } from 'lucide-react';
import { Layout } from '../../components/ui/Layout';
import { cn, formatDate, formatTime } from '../../utils';

// Mock data - replace with actual API calls
const mockData = {
  upcomingSessions: [
    {
      id: '1',
      therapy: 'Abhyanga (Oil Massage)',
      date: '2024-03-20',
      time: '10:00',
      practitioner: 'Dr. Sarah Smith',
      duration: 60,
      status: 'scheduled' as const,
    },
    {
      id: '2',
      therapy: 'Shirodhara',
      date: '2024-03-22',
      time: '14:30',
      practitioner: 'Dr. Sarah Smith',
      duration: 45,
      status: 'scheduled' as const,
    },
  ],
  progressMetrics: {
    completedSessions: 12,
    totalSessions: 20,
    currentProgram: 'Detox & Rejuvenation',
    progressPercentage: 60,
  },
  wellnessMetrics: [
    { name: 'Energy Level', value: 85, change: 12 },
    { name: 'Stress Level', value: 35, change: -20 },
    { name: 'Sleep Quality', value: 78, change: 15 },
    { name: 'Overall Mood', value: 82, change: 8 },
  ],
  recentFeedback: [
    {
      id: '1',
      sessionType: 'Abhyanga',
      rating: 5,
      date: '2024-03-18',
      comments: 'Felt very relaxed and energized after the session.',
    },
    {
      id: '2',
      sessionType: 'Meditation',
      rating: 4,
      date: '2024-03-16',
      comments: 'Good session, helped with stress management.',
    },
  ],
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
}> = ({ title, value, subtitle, icon: Icon, color = 'ayur', trend }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center">
      <div className={`p-2 rounded-md bg-${color}-100`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
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

const ProgressBar: React.FC<{ percentage: number; color?: string }> = ({ 
  percentage, 
  color = 'ayur' 
}) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

export const PatientDashboard: React.FC = () => {
  const { upcomingSessions, progressMetrics, wellnessMetrics, recentFeedback } = mockData;

  return (
    <Layout 
      title="Welcome Back!" 
      subtitle="Here's your wellness journey overview"
    >
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
          color="ayur"
        />
        <StatCard
          title="Next Session"
          value={upcomingSessions[0] ? formatDate(upcomingSessions[0].date, 'MMM dd') : 'None'}
          subtitle={upcomingSessions[0] ? formatTime(upcomingSessions[0].time) : 'No upcoming sessions'}
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
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
                <button className="btn btn-primary text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Session
                </button>
              </div>
            </div>
            <div className="p-6">
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center p-4 border border-gray-100 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-ayur-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-ayur-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{session.therapy}</h3>
                        <p className="text-sm text-gray-500">with {session.practitioner}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.date)} at {formatTime(session.time)} • {session.duration} min
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
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No upcoming sessions</h3>
                  <p className="mt-1 text-sm text-gray-500">Book your next therapy session to continue your wellness journey.</p>
                  <button className="mt-4 btn btn-primary">Book Session</button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Treatment Progress</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{progressMetrics.currentProgram}</span>
                  <span>{progressMetrics.completedSessions} of {progressMetrics.totalSessions} sessions</span>
                </div>
                <ProgressBar percentage={progressMetrics.progressPercentage} />
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

        {/* Recent Feedback & Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
                <Calendar className="h-5 w-5 text-ayur-600 mr-3" />
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

          {/* Recent Feedback */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Feedback</h2>
            </div>
            <div className="p-6">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{feedback.sessionType}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-3 h-3 rounded-full mr-1",
                            i < feedback.rating ? "bg-yellow-400" : "bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{feedback.comments}</p>
                  <p className="text-xs text-gray-500">{formatDate(feedback.date)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};