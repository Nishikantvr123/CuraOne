import { findMany, findOne, insertOne, updateOne, deleteOne } from '../config/database.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const { search, status, constitution } = req.query;
    
    let patients = findMany('users', { role: 'patient' });
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(p => 
        p.firstName?.toLowerCase().includes(searchLower) ||
        p.lastName?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.includes(search)
      );
    }
    
    if (status) {
      patients = patients.filter(p => p.status === status);
    }
    
    if (constitution) {
      patients = patients.filter(p => p.constitution === constitution);
    }
    
    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = findOne('users', { id: parseInt(id), role: 'patient' });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check if email already exists
    const existingUser = findOne('users', { email: patientData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Get all users to determine next ID
    const allUsers = findMany('users');
    const maxId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id || 0)) : 0;
    
    const newPatient = await insertOne('users', {
      id: maxId + 1,
      role: 'patient',
      status: 'active',
      isActive: true,
      ...patientData
    });
    
    res.status(201).json({
      success: true,
      data: newPatient,
      message: 'Patient created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const patient = findOne('users', { id: parseInt(id), role: 'patient' });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Check authorization - users can only update their own profile unless admin/practitioner
    if (req.user.role === 'patient' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this patient'
      });
    }
    
    const updatedPatient = await updateOne('users', { id: parseInt(id) }, {
      ...updates,
      id: parseInt(id), // Ensure ID doesn't change
      role: 'patient' // Ensure role doesn't change
    });
    
    res.json({
      success: true,
      data: updatedPatient,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = findOne('users', { id: parseInt(id), role: 'patient' });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    await deleteOne('users', { id: parseInt(id) });
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
