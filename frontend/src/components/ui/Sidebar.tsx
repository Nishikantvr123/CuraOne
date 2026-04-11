import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Activity, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  Heart,
  Clock,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ];

    if (user?.role === 'patient') {
      return [
        ...commonItems,
        { name: 'My Sessions', href: '/sessions', icon: Activity },
        { name: 'Progress', href: '/progress', icon: Heart },
        { name: 'Feedback', href: '/feedback', icon: MessageSquare },
        { name: 'History', href: '/history', icon: FileText },
      ];
    }

    if (user?.role === 'practitioner') {
      return [
        ...commonItems,
        { name: 'Patients', href: '/patients', icon: Users },
        { name: 'Sessions', href: '/sessions', icon: Activity },
        { name: 'Schedule', href: '/schedule', icon: Clock },
        { name: 'Reports', href: '/reports', icon: FileText },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'System', href: '/system', icon: Settings },
        { name: 'Reports', href: '/reports', icon: FileText },
      ];
    }

    return commonItems;
  };

  const navigation = getNavigationItems();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 overflow-y-auto">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-ayur-50 text-ayur-600 border-r-2 border-ayur-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActive ? 'text-ayur-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Role Badge */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  user?.role === 'patient' ? 'bg-blue-500' :
                  user?.role === 'practitioner' ? 'bg-emerald-500' :
                  'bg-purple-500'
                )} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {user?.role}
                </p>
                <p className="text-xs text-gray-500">
                  Access Level
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};