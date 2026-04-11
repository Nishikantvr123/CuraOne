import apiService from './api.js';

class DashboardService {
  // Get patient progress metrics
  async getProgress() {
    try {
      const response = await apiService.get('/patient/dashboard/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  }

  // Get upcoming sessions
  async getUpcomingSessions() {
    try {
      const response = await apiService.get('/patient/dashboard/sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // Get wellness data
  async getWellnessData() {
    try {
      const response = await apiService.get('/patient/dashboard/wellness');
      return response.data;
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      throw error;
    }
  }

  // Get wellness progress over time
  async getWellnessProgress() {
    try {
      const response = await apiService.get('/patient/dashboard/wellness/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching wellness progress:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
