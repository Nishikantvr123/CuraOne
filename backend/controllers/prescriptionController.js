/**
 * Prescription Controller for CuraOne
 * E-Prescription system management
 */

import { findMany, findOne, insertOne, updateOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Create new prescription
 * @route   POST /api/prescriptions
 * @access  Private (Practitioners only)
 */
export const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosis,
      medications,
      instructions,
      duration,
      notes
    } = req.body;

    if (!patientId || !diagnosis || !medications || !Array.isArray(medications) || medications.length === 0) {
      res.status(400);
      throw new Error('Patient ID, diagnosis, and at least one medication are required');
    }

    const patient = findOne('users', { id: patientId, role: 'patient' });
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    const inventoryItems = findMany('inventory');
    const medicationDetails = [];

    for (const med of medications) {
      if (!med.name || !med.dosage || !med.frequency) {
        res.status(400);
        throw new Error('Each medication must have name, dosage, and frequency');
      }

      const inventoryItem = inventoryItems.find(
        item => item.name.toLowerCase() === med.name.toLowerCase()
      );

      if (inventoryItem) {
        const requiredQty = med.quantity || 1;
        if (inventoryItem.quantity < requiredQty) {
          res.status(400);
          throw new Error(`Insufficient stock for ${med.name}. Available: ${inventoryItem.quantity}`);
        }

        updateOne('inventory', { id: inventoryItem.id }, {
          quantity: inventoryItem.quantity - requiredQty,
          updatedAt: new Date().toISOString()
        });
      }

      medicationDetails.push({
        ...med,
        inventoryId: inventoryItem?.id || null
      });
    }

    const prescription = {
      id: uuidv4(),
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      practitionerId: req.user.id,
      practitionerName: `${req.user.firstName} ${req.user.lastName}`,
      diagnosis,
      medications: medicationDetails,
      instructions: instructions || '',
      duration: duration || '30 days',
      notes: notes || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await insertOne('prescriptions', prescription);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's prescriptions (patients see their own, practitioners see ones they created)
 * @route   GET /api/prescriptions/my
 * @access  Private
 */
export const getMyPrescriptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'practitioner') {
      query.practitionerId = req.user.id;
    }

    let prescriptions = findMany('prescriptions', query, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (status) {
      prescriptions = prescriptions.filter(p => p.status === status);
    }

    const total = prescriptions.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPrescriptions = prescriptions.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        prescriptions: paginatedPrescriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = findOne('prescriptions', { id: req.params.id });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    if (
      req.user.role === 'patient' && prescription.patientId !== req.user.id &&
      req.user.role === 'practitioner' && prescription.practitionerId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to view this prescription');
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update prescription
 * @route   PUT /api/prescriptions/:id
 * @access  Private (Practitioners only)
 */
export const updatePrescription = async (req, res, next) => {
  try {
    const prescription = findOne('prescriptions', { id: req.params.id });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    if (prescription.practitionerId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this prescription');
    }

    const { status, notes, instructions } = req.body;

    const updatedPrescription = updateOne('prescriptions', { id: req.params.id }, {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(instructions !== undefined && { instructions }),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedPrescription
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  updatePrescription
};
