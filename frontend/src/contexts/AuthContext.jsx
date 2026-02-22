import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService.js';
import socketService from '../services/socketService.js';

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
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
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

  // Check for existing authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Validate token by fetching user profile
          const user = await authService.getProfile();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          
          // Connect socket for real-time notifications
          socketService.connect(user.id);
        } catch (error) {
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
      
      const { user } = await authService.register(transformedData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      // Connect socket for real-time notifications
      socketService.connect(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
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

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
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