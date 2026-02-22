import { findOne, find, create, update, deleteOne } from '../config/database.js';

// @desc    Get all therapies
// @route   GET /api/therapies
// @access  Public
export const getAllTherapies = async (req, res, next) => {
  try {
    const { category, active = 'true' } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (active === 'true') {
      query.isActive = true;
    }

    const therapies = find('therapies', query);

    res.json({
      success: true,
      data: {
        therapies,
        count: therapies.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get therapies by category
// @route   GET /api/therapies/category/:category
// @access  Public
export const getTherapiesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    const therapies = find('therapies', {
      category: category,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        category,
        therapies,
        count: therapies.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single therapy
// @route   GET /api/therapies/:id
// @access  Public
export const getTherapyById = async (req, res, next) => {
  try {
    const therapy = findOne('therapies', { id: req.params.id });

    if (!therapy) {
      res.status(404);
      throw new Error('Therapy not found');
    }

    res.json({
      success: true,
      data: { therapy }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new therapy
// @route   POST /api/therapies
// @access  Private (Admin)
export const createTherapy = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      description,
      duration,
      defaultDuration,
      category,
      price,
      benefits,
      precautions,
      contraindications
    } = req.body;

    if (!name || !description || !duration || !category || !price) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const therapy = create('therapies', {
      name,
      fullName: fullName || name,
      description,
      duration: parseInt(duration),
      defaultDuration: parseInt(defaultDuration || duration),
      category,
      price: parseFloat(price),
      benefits: benefits || [],
      precautions: precautions || [],
      contraindications: contraindications || [],
      isActive: true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Therapy created successfully',
      data: { therapy }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update therapy
// @route   PUT /api/therapies/:id
// @access  Private (Admin)
export const updateTherapy = async (req, res, next) => {
  try {
    const therapy = findOne('therapies', { id: req.params.id });

    if (!therapy) {
      res.status(404);
      throw new Error('Therapy not found');
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    };

    // Convert numeric fields
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }
    if (updateData.defaultDuration) {
      updateData.defaultDuration = parseInt(updateData.defaultDuration);
    }
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    const updatedTherapy = update('therapies', req.params.id, updateData);

    res.json({
      success: true,
      message: 'Therapy updated successfully',
      data: { therapy: updatedTherapy }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete therapy
// @route   DELETE /api/therapies/:id
// @access  Private (Admin)
export const deleteTherapy = async (req, res, next) => {
  try {
    const therapy = findOne('therapies', { id: req.params.id });

    if (!therapy) {
      res.status(404);
      throw new Error('Therapy not found');
    }

    // Soft delete - just mark as inactive
    const updatedTherapy = update('therapies', req.params.id, {
      isActive: false,
      deletedBy: req.user.id,
      deletedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Therapy deactivated successfully',
      data: { therapy: updatedTherapy }
    });
  } catch (error) {
    next(error);
  }
};