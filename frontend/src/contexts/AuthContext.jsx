import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService.js';
import socketService from '../services/socketService.js';
import apiService from '../services/api.js';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      const updatedUser = state.user ? { ...state.user, ...action.payload } : null;
      // Update localStorage immediately
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return {
        ...state,
        user: updatedUser,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initAuthRef = React.useRef(false);

  // Check for existing authentication on app load
  useEffect(() => {
    // Prevent multiple simultaneous auth checks
    if (initAuthRef.current) return;
    initAuthRef.current = true;
    
    const initAuth = async () => {
      const isAuth = authService.isAuthenticated();
      
      if (isAuth) {
        try {
          // Validate token by fetching user profile
          const user = await authService.getProfile();
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          
          // Connect socket for real-time notifications
          socketService.connect(user.id);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          // Token is invalid, logout user
          await authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user } = await authService.login(email, password);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      // Connect socket for real-time notifications
      socketService.connect(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Transform name field to firstName and lastName for backend
      const transformedData = { ...userData };
      
      if (userData.name) {
        const nameParts = userData.name.trim().split(' ');
        transformedData.firstName = nameParts[0] || '';
        transformedData.lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'User';
        delete transformedData.name;
      }
      
      // Remove confirmPassword field as backend doesn't need it
      delete transformedData.confirmPassword;
      
      // Call register API
      const { user, token } = await authService.register(transformedData);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      // Connect socket for real-time notifications
      socketService.connect(user.id);
      
      // Force a complete page reload to ensure fresh state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Disconnect socket
      socketService.disconnect();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      // Update localStorage first
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Then update state
      dispatch({ type: 'UPDATE_USER', payload: userData });
      return updatedUser;
    }
    return null;
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};