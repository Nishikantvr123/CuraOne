import apiService from './api.js';

class WellnessService {
  // Create wellness check-in
  async createCheckIn(checkInData) {
    try {
      const response = await apiService.post('/wellness/checkin', checkInData);
      
      if (response.success) {
        return response.data.checkIn;
      }
      
      throw new Error(response.message || 'Failed to create wellness check-in');
    } catch (error) {
      throw error;
    }
  }

  // Get wellness history
  async getWellnessHistory(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/wellness/history${queryString ? '?' + queryString : ''}`;
      
      const response = await apiService.get(endpoint);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch wellness history');
    } catch (error) {
      throw error;
    }
  }

  // Get wellness statistics
  async getWellnessStats(period = '30') {
    try {
      const response = await apiService.get(`/wellness/stats?period=${period}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch wellness stats');
    } catch (error) {
      throw error;
    }
  }

  // Get wellness insights
  async getWellnessInsights(period = '30') {
    try {
      const response = await apiService.get(`/wellness/insights?period=${period}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch wellness insights');
    } catch (error) {
      throw error;
    }
  }

  // Update wellness check-in
  async updateCheckIn(id, updateData) {
    try {
      const response = await apiService.put(`/wellness/checkin/${id}`, updateData);
      
      if (response.success) {
        return response.data.checkIn;
      }
      
      throw new Error(response.message || 'Failed to update wellness check-in');
    } catch (error) {
      throw error;
    }
  }

  // Delete wellness check-in
  async deleteCheckIn(id) {
    try {
      const response = await apiService.delete(`/wellness/checkin/${id}`);
      
      if (response.success) {
        return true;
      }
      
      throw new Error(response.message || 'Failed to delete wellness check-in');
    } catch (error) {
      throw error;
    }
  }

  // Get today's check-in status
  async getTodayCheckInStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const history = await this.getWellnessHistory({
        startDate: today,
        endDate: today,
        limit: 1
      });
      
      return {
        hasCheckedIn: history.checkIns && history.checkIns.length > 0,
        checkIn: history.checkIns && history.checkIns.length > 0 ? history.checkIns[0] : null
      };
    } catch (error) {
      throw error;
    }
  }

  // Calculate wellness score from metrics
  calculateWellnessScore(metrics) {
    if (!metrics || metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + (metric.value || 0), 0);
    const average = total / metrics.length;
    
    // Convert to percentage (assuming max value is 10)
    return Math.round((average / 10) * 100);
  }

  // Get wellness trends
  getWellnessTrends(history) {
    if (!history || history.length < 2) {
      return {
        overall: 'stable',
        trends: {}
      };
    }

    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const midpoint = Math.floor(sortedHistory.length / 2);
    
    const firstHalf = sortedHistory.slice(0, midpoint);
    const secondHalf = sortedHistory.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (item.wellnessScore || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (item.wellnessScore || 0), 0) / secondHalf.length;
    
    const change = secondHalfAvg - firstHalfAvg;
    const overall = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';

    return {
      overall,
      change: Math.round(change),
      trends: {
        current: Math.round(secondHalfAvg),
        previous: Math.round(firstHalfAvg)
      }
    };
  }
}

// Create and export a singleton instance
export const wellnessService = new WellnessService();
export default wellnessService;