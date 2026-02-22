import apiService from './api.js';

class TherapyService {
  // Get all therapies
  async getAllTherapies(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/therapies${queryString ? '?' + queryString : ''}`;
      
      const response = await apiService.get(endpoint);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch therapies');
    } catch (error) {
      throw error;
    }
  }

  // Get therapies by category
  async getTherapiesByCategory(category) {
    try {
      const response = await apiService.get(`/therapies/category/${category}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch therapies');
    } catch (error) {
      throw error;
    }
  }

  // Get therapy by ID
  async getTherapyById(id) {
    try {
      const response = await apiService.get(`/therapies/${id}`);
      
      if (response.success) {
        return response.data.therapy;
      }
      
      throw new Error(response.message || 'Failed to fetch therapy');
    } catch (error) {
      throw error;
    }
  }

  // Create new therapy (admin only)
  async createTherapy(therapyData) {
    try {
      const response = await apiService.post('/therapies', therapyData);
      
      if (response.success) {
        return response.data.therapy;
      }
      
      throw new Error(response.message || 'Failed to create therapy');
    } catch (error) {
      throw error;
    }
  }

  // Update therapy (admin only)
  async updateTherapy(id, updateData) {
    try {
      const response = await apiService.put(`/therapies/${id}`, updateData);
      
      if (response.success) {
        return response.data.therapy;
      }
      
      throw new Error(response.message || 'Failed to update therapy');
    } catch (error) {
      throw error;
    }
  }

  // Delete therapy (admin only)
  async deleteTherapy(id) {
    try {
      const response = await apiService.delete(`/therapies/${id}`);
      
      if (response.success) {
        return true;
      }
      
      throw new Error(response.message || 'Failed to delete therapy');
    } catch (error) {
      throw error;
    }
  }

  // Get therapy categories
  getTherapyCategories() {
    return [
      { id: 'detox', name: 'Detoxification', description: 'Cleansing and detox therapies' },
      { id: 'rejuvenation', name: 'Rejuvenation', description: 'Revitalizing and anti-aging treatments' },
      { id: 'healing', name: 'Healing', description: 'Therapeutic and curative treatments' },
      { id: 'wellness', name: 'Wellness', description: 'General wellness and preventive care' }
    ];
  }

  // Format therapy duration
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    
    return `${mins}m`;
  }

  // Format therapy price
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  // Get therapy benefits summary
  getBenefitsSummary(therapy) {
    if (!therapy.benefits || therapy.benefits.length === 0) {
      return 'No specific benefits listed';
    }
    
    if (therapy.benefits.length <= 3) {
      return therapy.benefits.join(', ');
    }
    
    return `${therapy.benefits.slice(0, 3).join(', ')} and ${therapy.benefits.length - 3} more benefits`;
  }

  // Check therapy availability
  isTherapyAvailable(therapy) {
    return therapy && therapy.isActive === true;
  }

  // Get recommended therapies based on user preferences
  getRecommendedTherapies(therapies, userPreferences = {}) {
    if (!therapies || therapies.length === 0) return [];
    
    let recommended = [...therapies];
    
    // Filter by category preference
    if (userPreferences.preferredCategory) {
      recommended = recommended.filter(therapy => 
        therapy.category === userPreferences.preferredCategory
      );
    }
    
    // Filter by price range
    if (userPreferences.maxPrice) {
      recommended = recommended.filter(therapy => 
        therapy.price <= userPreferences.maxPrice
      );
    }
    
    // Filter by duration preference
    if (userPreferences.maxDuration) {
      recommended = recommended.filter(therapy => 
        therapy.duration <= userPreferences.maxDuration
      );
    }
    
    // Sort by popularity or rating (mock implementation)
    recommended.sort((a, b) => {
      // In a real app, this would sort by actual ratings/popularity
      return Math.random() - 0.5;
    });
    
    return recommended.slice(0, 5); // Return top 5 recommendations
  }
}

// Create and export a singleton instance
export const therapyService = new TherapyService();
export default therapyService;