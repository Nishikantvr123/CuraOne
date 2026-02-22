import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Settings,
  X
} from 'lucide-react';
import { useRealtime } from '../../contexts/RealtimeContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const RealtimeStatus = ({ showDetailed = false, className = '' }) => {
  const { 
    isConnected, 
    systemStatus, 
    getConnectionInfo, 
    simulateRealtimeEvent,
    realtimeNotifications,
    clearNotifications 
  } = useRealtime();
  
  const [showPanel, setShowPanel] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({});

  useEffect(() => {
    if (showDetailed) {
      const info = getConnectionInfo();
      setConnectionInfo(info);
    }
  }, [isConnected, systemStatus, showDetailed, getConnectionInfo]);

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'online':
        return 'Connected';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (!showDetailed) {
    // Simple status indicator
    return (
      <div className={cn(
        "flex items-center space-x-2 px-2 py-1 rounded-full border text-xs font-medium transition-all duration-200",
        getStatusColor(),
        className
      )}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {isConnected && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs">Live</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={cn("relative", className)}>
      {/* Status Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-md",
          getStatusColor()
        )}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {isConnected && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        )}
        <Settings className="h-4 w-4 opacity-50" />
      </button>

      {/* Detailed Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Real-time Status
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Connection Info */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon()}
                    <span className="font-medium">{getStatusText()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Socket ID:</span>
                  <span className="font-mono text-xs text-gray-800">
                    {connectionInfo.socketId ? 
                      `${connectionInfo.socketId.substring(0, 8)}...` : 
                      'N/A'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Online Users:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{connectionInfo.onlineUsers || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Connected:</span>
                  <span className="text-xs text-gray-700">
                    {connectionInfo.lastConnected ? 
                      connectionInfo.lastConnected.toLocaleTimeString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Recent Updates</h4>
                  {realtimeNotifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {realtimeNotifications.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {realtimeNotifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-l-blue-400">
                        <div className="font-medium text-gray-900">{notification.message}</div>
                        <div className="text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {realtimeNotifications.length > 3 && (
                      <div className="text-xs text-center text-gray-500 py-1">
                        +{realtimeNotifications.length - 3} more notifications
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No recent real-time updates
                  </div>
                )}
              </div>

              {/* Demo Controls */}
              {process.env.NODE_ENV === 'development' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Demo Controls</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => simulateRealtimeEvent('notification')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      disabled={!isConnected}
                    >
                      Send Alert
                    </button>
                    <button
                      onClick={() => simulateRealtimeEvent('booking')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      disabled={!isConnected}
                    >
                      Booking Update
                    </button>
                    <button
                      onClick={() => simulateRealtimeEvent('wellness')}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      disabled={!isConnected}
                    >
                      Wellness Alert
                    </button>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Connect to try demo features
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealtimeStatus;