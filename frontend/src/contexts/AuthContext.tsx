import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils';

// Mock storage functions since we don't have the utils file in JS yet
const mockStorage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = storage.get('auth_token');
    const user = storage.get<User>('user');
    
    if (token && user) {
      // In a real app, you would validate the token with your backend
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: '1',
        name: email === 'patient@ayursutra.com' ? 'John Doe' : 
              email === 'practitioner@ayursutra.com' ? 'Dr. Sarah Smith' : 'Admin User',
        email,
        role: email === 'patient@ayursutra.com' ? 'patient' : 
              email === 'practitioner@ayursutra.com' ? 'practitioner' : 'admin',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=0ea5e9&color=fff`,
        phone: '+1-555-0123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store authentication data
      storage.set('auth_token', 'mock_jwt_token');
      storage.set('user', mockUser);

      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const register = async (userData: any): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Math.random().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=10b981&color=fff`,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.set('auth_token', 'mock_jwt_token');
      storage.set('user', newUser);

      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const logout = (): void => {
    storage.remove('auth_token');
    storage.remove('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>): void => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      storage.set('user', updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
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