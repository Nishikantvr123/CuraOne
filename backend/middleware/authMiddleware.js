import jwt from 'jsonwebtoken';
import { findOne } from '../config/database.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = findOne('users', { id: decoded.id });

      if (!user || !user.isActive) {
        res.status(401);
        throw new Error('Not authorized - user not found or inactive');
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;

      next();
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      res.status(401);
      throw new Error('Not authorized - token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token');
  }
};

// Admin access required
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - admin role required');
  }
};

// Practitioner access required
export const practitioner = (req, res, next) => {
  if (req.user && (req.user.role === 'practitioner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - practitioner role required');
  }
};

// Patient access required (or higher)
export const patient = (req, res, next) => {
  if (req.user && ['patient', 'practitioner', 'admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - insufficient permissions');
  }
};

// Check if user owns resource or is admin/practitioner
export const ownerOrAuthorized = (req, res, next) => {
  if (
    req.user && (
      req.user.role === 'admin' ||
      req.user.role === 'practitioner' ||
      req.user.id === req.params.userId ||
      req.user.id === req.body.userId ||
      req.user.id === req.query.userId
    )
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - not authorized to access this resource');
  }
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Validate request with specific permissions
export const validatePermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized - authentication required');
    }

    const hasPermission = permissions.some(permission => {
      switch (permission) {
        case 'admin':
          return req.user.role === 'admin';
        case 'practitioner':
          return ['practitioner', 'admin'].includes(req.user.role);
        case 'patient':
          return ['patient', 'practitioner', 'admin'].includes(req.user.role);
        case 'owner':
          return req.user.id === req.params.userId || 
                 req.user.id === req.body.userId ||
                 req.user.id === req.query.userId;
        default:
          return false;
      }
    });

    if (hasPermission) {
      next();
    } else {
      res.status(403);
      throw new Error('Access denied - insufficient permissions');
    }
  };
};