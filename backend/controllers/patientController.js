import mongoose from 'mongoose';
import { findMany, findOne, insertOne, updateOne, deleteOne, getModel } from '../config/database.js';

// Get all patients (only those added to dashboard)
export const getAllPatients = async (req, res) => {
  try {
    const { search, status, constitution } = req.query;

    let patients = await findMany('users', { role: 'patient' });

    // Only show patients added to dashboard
    patients = patients.filter(p => p.addedToDashboard === true);

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

// Get registered users not yet added to dashboard
export const getRegisteredPatients = async (req, res) => {
  try {
    const allPatients = await findMany('users', { role: 'patient' });
    const unaddedPatients = allPatients.filter(p => !p.addedToDashboard);
    
    console.log('📋 Total patients:', allPatients.length);
    console.log('📋 Unadded patients:', unaddedPatients.length);
    if (unaddedPatients.length > 0) {
      console.log('📋 Sample unadded patient:');
      console.log('   - ID:', unaddedPatients[0].id);
      console.log('   - Email:', unaddedPatients[0].email);
      console.log('   - Name:', unaddedPatients[0].firstName, unaddedPatients[0].lastName);
    }
    
    res.json({
      success: true,
      data: unaddedPatients
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
    const patient = await findOne('users', { id });

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

// Create new patient / Add registered user to dashboard
export const createPatient = async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    if (userId) {
      // Direct MongoDB query - findOne helper isn't working reliably
      const Model = getModel('users');
      const allUsers = await Model.find({ role: 'patient' }).lean();
      const userDoc = allUsers.find(u => String(u._id) === userId);
      
      console.log('🔎 Looking for userId:', userId);
      console.log('✅ Found user:', userDoc ? userDoc.email : 'NULL');

      if (!userDoc) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Convert to plain object with id field
      const existingUser = { ...userDoc, id: String(userDoc._id) };
      delete existingUser._id;

      if (existingUser.addedToDashboard) {
        return res.status(400).json({
          success: false,
          error: 'This user is already added to the dashboard'
        });
      }

      // Query by email to get the actual document
      const actualDoc = await Model.findOne({ email: userDoc.email }).lean();
      
      if (!actualDoc) {
        return res.status(404).json({
          success: false,
          error: 'User not found in database'
        });
      }
      
      // Update by email (more reliable than _id in this schema)
      const updateResult = await Model.updateOne(
        { email: actualDoc.email },
        {
          $set: {
            ...profileData,
            addedToDashboard: true,
            role: 'patient',
            status: 'active',
            isActive: true,
            updatedAt: new Date()
          }
        }
      );

      // Fetch the updated document
      const updatedDoc = await Model.findOne({ email: actualDoc.email }).lean();
      
      console.log('✅ Updated user:', updatedDoc ? updatedDoc.email : 'NULL');

      if (!updatedDoc) {
        return res.status(500).json({
          success: false,
          error: 'Update failed'
        });
      }

      // Convert to response format
      const result = { ...updatedDoc, id: String(updatedDoc._id) };
      delete result._id;

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Patient added to dashboard successfully'
      });
    }

    // Fallback: creating brand new patient manually
    const emailExists = await findOne('users', { email: profileData.email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const allUsers = await findMany('users');
    const maxId = allUsers.length > 0
      ? Math.max(...allUsers.map(u => u.id || 0))
      : 0;

    const newPatient = await insertOne('users', {
      id: maxId + 1,
      role: 'patient',
      status: 'active',
      isActive: true,
      addedToDashboard: true,
      ...profileData
    });

    res.status(201).json({
      success: true,
      data: newPatient,
      message: 'Patient created successfully'
    });

  } catch (error) {
    console.error('❌ createPatient error:', error);
    console.error('❌ Stack:', error.stack);
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

    const Model = getModel('users');
    
    // Find patient by searching all patients
    const allPatients = await Model.find({ role: 'patient' }).lean();
    const patient = allPatients.find(p => String(p._id) === id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Update by email (more reliable than _id)
    await Model.updateOne(
      { email: patient.email },
      {
        $set: {
          ...updates,
          role: 'patient',
          updatedAt: new Date()
        }
      }
    );

    // Fetch updated document
    const updatedDoc = await Model.findOne({ email: patient.email }).lean();

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const result = { ...updatedDoc, id: String(updatedDoc._id) };
    delete result._id;

    res.json({
      success: true,
      data: result,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    console.error('❌ updatePatient error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete patient (remove from dashboard)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const Model = getModel('users');
    
    // Find patient by searching all patients (same approach as create)
    const allPatients = await Model.find({ role: 'patient' }).lean();
    const patient = allPatients.find(p => String(p._id) === id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Remove from dashboard by setting addedToDashboard to false
    const updateResult = await Model.updateOne(
      { email: patient.email },
      {
        $set: {
          addedToDashboard: false,
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to remove patient from dashboard'
      });
    }

    res.json({
      success: true,
      message: 'Patient removed from dashboard successfully'
    });
  } catch (error) {
    console.error('❌ deletePatient error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};