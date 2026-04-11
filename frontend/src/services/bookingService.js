import apiService from './api.js';

class BookingService {
  // Get user's bookings
  async getMyBookings(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/bookings/my-bookings${queryString ? '?' + queryString : ''}`;
      
      const response = await apiService.get(endpoint);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch bookings');
    } catch (error) {
      throw error;
    }
  }

  // Get booking by ID
  async getBookingById(id) {
    try {
      const response = await apiService.get(`/bookings/${id}`);
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to fetch booking');
    } catch (error) {
      throw error;
    }
  }

  // Create new booking
  async createBooking(bookingData) {
    try {
      const response = await apiService.post('/bookings', bookingData);
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to create booking');
    } catch (error) {
      throw error;
    }
  }

  // Update booking
  async updateBooking(id, updateData) {
    try {
      const response = await apiService.put(`/bookings/${id}`, updateData);
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to update booking');
    } catch (error) {
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(id, reason = '') {
    try {
      const response = await apiService.put(`/bookings/${id}/cancel`, { reason });
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to cancel booking');
    } catch (error) {
      throw error;
    }
  }

  // Reschedule booking
  async rescheduleBooking(id, newDate, newTime) {
    try {
      const response = await apiService.put(`/bookings/${id}/reschedule`, {
        newDate,
        newTime
      });
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to reschedule booking');
    } catch (error) {
      throw error;
    }
  }

  // Confirm booking (practitioner only)
  async confirmBooking(id) {
    try {
      const response = await apiService.put(`/bookings/${id}/confirm`);
      
      if (response.success) {
        return response.data.booking;
      }
      
      throw new Error(response.message || 'Failed to confirm booking');
    } catch (error) {
      throw error;
    }
  }

  // Get available time slots
  async getAvailableSlots(practitionerId, date) {
    try {
      const response = await apiService.get(`/bookings/available-slots/${practitionerId}?date=${date}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch available slots');
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a singleton instance
export const bookingService = new BookingService();
export default bookingService;