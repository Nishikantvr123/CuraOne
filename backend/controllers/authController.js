import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findOne, create, update } from '../config/database.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/validation.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'patient', phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    if (!validateEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    if (!validatePassword(password)) {
      res.status(400);
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Check if user already exists
    const existingUser = findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      email: sanitizeInput(email.toLowerCase()),
      password: hashedPassword,
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      role: ['patient', 'practitioner', 'admin'].includes(role) ? role : 'patient',
      phone: phone ? sanitizeInput(phone) : null,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'en',
        timezone: 'UTC'
      }
    };

    const newUser = await create('users', userData);

    // Generate token
    const token = generateToken(newUser.id);

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check for user
    const user = findOne('users', { email: email.toLowerCase() });

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is inactive. Please contact support.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Update last login
    await update('users', user.id, { lastLogin: new Date().toISOString() });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = findOne('users', { id: req.user.id });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      dateOfBirth,
      address,
      constitution,
      medicalHistory,
      preferences 
    } = req.body;

    const updateData = {};

    if (firstName) updateData.firstName = sanitizeInput(firstName);
    if (lastName) updateData.lastName = sanitizeInput(lastName);
    if (phone) updateData.phone = sanitizeInput(phone);
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (address) updateData.address = sanitizeInput(address);
    if (constitution) updateData.constitution = constitution;
    if (medicalHistory) updateData.medicalHistory = sanitizeInput(medicalHistory);
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    updateData.updatedAt = new Date().toISOString();

    const updatedUser = await update('users', req.user.id, updateData);

    if (!updatedUser) {
      res.status(404);
      throw new Error('User not found');
    }

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new password');
    }

    if (!validatePassword(newPassword)) {
      res.status(400);
      throw new Error('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Get current user with password
    const user = findOne('users', { id: req.user.id });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await update('users', req.user.id, {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // In a real JWT implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    // The client should remove the token from storage

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public (but requires valid token in body)
export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error('Token is required');
    }

    // Verify the token (this will throw if invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = findOne('users', { id: decoded.id });

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('User not found or inactive');
    }

    // Generate new token
    const newToken = generateToken(user.id);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    next(error);
  }
};