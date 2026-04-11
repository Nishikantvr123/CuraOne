import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContainer } from './components/auth/AuthContainer';
import { EnhancedPatientDashboard } from './pages/patient/EnhancedDashboard';
import PractitionerDashboard from './pages/practitioner/PractitionerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatWidget from './components/CuraBot/ChatWidget';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-ayur-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'patient':
      return <EnhancedPatientDashboard />;
    case 'practitioner':
      return <PractitionerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Memoize to prevent unnecessary re-renders
  const authStatus = React.useMemo(() => ({
    isAuthenticated,
    isLoading
  }), [isAuthenticated, isLoading]);
  
  if (authStatus.isLoading) {
    return <Loading />;
  }
  
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={authStatus.isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthContainer />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          authStatus.isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/auth" replace />
        } 
      />
      {/* Catch all route */}
      <Route 
        path="*" 
        element={<Navigate to={authStatus.isAuthenticated ? "/dashboard" : "/auth"} replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RealtimeProvider>
          <NotificationProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
                <ChatWidgetWrapper />
              </div>
            </Router>
          </NotificationProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const ChatWidgetWrapper = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ChatWidget /> : null;
}

export default App;
