import jwt from 'jsonwebtoken';
import { findOne } from '../config/database.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ success: false, error: 'Not authorized - no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 Token decoded ID:', decoded.id);
    const user = await findOne('users', { id: decoded.id });
     console.log('👤 Found user:', user ? user.email : 'NULL');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Not authorized - user not found or inactive' });
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    return next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ success: false, error: 'Not authorized - token failed' });
  }
};

// Admin only
export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Access denied - admin role required' });
};

// Practitioner or admin
export const practitioner = (req, res, next) => {
  if (req.user && ['practitioner', 'admin'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, error: 'Access denied - practitioner role required' });
};

// Any authenticated user
export const patient = (req, res, next) => {
  if (req.user && ['patient', 'practitioner', 'admin'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, error: 'Access denied - insufficient permissions' });
};

// Owner or authorized
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
    return next();
  }
  return res.status(403).json({ success: false, error: 'Access denied - not authorized to access this resource' });
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Validate request with specific permissions
export const validatePermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized - authentication required' });
    }

    const hasPermission = permissions.some(permission => {
      switch (permission) {
        case 'admin': return req.user.role === 'admin';
        case 'practitioner': return ['practitioner', 'admin'].includes(req.user.role);
        case 'patient': return ['patient', 'practitioner', 'admin'].includes(req.user.role);
        case 'owner':
          return req.user.id === req.params.userId ||
                 req.user.id === req.body.userId ||
                 req.user.id === req.query.userId;
        default: return false;
      }
    });

    if (hasPermission) return next();
    return res.status(403).json({ success: false, error: 'Access denied - insufficient permissions' });
  };
};
