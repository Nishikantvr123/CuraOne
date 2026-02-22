import apiService from './api';

class PatientService {
  // Get all patients
  async getAllPatients(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/patients?${queryParams}` : '/patients';
    return await apiService.get(endpoint);
  }

  // Get patient by ID
  async getPatientById(id) {
    return await apiService.get(`/patients/${id}`);
  }

  // Create new patient
  async createPatient(patientData) {
    return await apiService.post('/patients', patientData);
  }

  // Update patient
  async updatePatient(id, patientData) {
    return await apiService.put(`/patients/${id}`, patientData);
  }

  // Delete patient
  async deletePatient(id) {
    return await apiService.delete(`/patients/${id}`);
  }
}

export const patientService = new PatientService();
export default patientService;
