import apiService from './api.js';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token in API service
        apiService.setToken(token);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token in API service
        apiService.setToken(token);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      apiService.setToken(null);
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile');
      
      if (response.success && response.data) {
        const { user } = response.data;
        
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      }
      
      throw new Error(response.message || 'Failed to fetch profile');
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const response = await apiService.put('/auth/profile', updateData);
      
      if (response.success && response.data) {
        const { user } = response.data;
        
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        return true;
      }
      
      throw new Error(response.message || 'Failed to change password');
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const currentToken = apiService.getToken();
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await apiService.post('/auth/refresh', { token: currentToken });
      
      if (response.success && response.data) {
        const { token } = response.data;
        apiService.setToken(token);
        return token;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = apiService.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;