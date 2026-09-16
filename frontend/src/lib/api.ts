import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('curaone_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid/expired and request wasn't the login endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('curaone_token');
      // Dispatch custom event so AuthContext can synchronize if needed
      window.dispatchEvent(new Event('curaone:unauthorized'));
    }
    return Promise.reject(error);
  }
);
