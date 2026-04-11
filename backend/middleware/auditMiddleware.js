/**
 * Audit Logging Middleware for CuraOne
 * Logs all write operations (POST/PUT/DELETE) for compliance and tracking
 */

import { insertOne } from '../config/database.js';

// Fields to exclude from audit logs for security
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

/**
 * Sanitize data by removing sensitive fields
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  if (Array.isArray(sanitized)) {
    return sanitized.map(item => sanitizeData(item));
  }
  
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
};

/**
 * Create audit log entry
 */
const createAuditLog = async (logData) => {
  try {
    await insertOne('auditLogs', {
      ...logData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to create audit log:', error.message);
  }
};

/**
 * Audit middleware - logs all mutating requests
 */
export const auditMiddleware = (req, res, next) => {
  // Only audit write operations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }
  
  // Skip certain routes from audit (like auth login for security)
  const skipRoutes = ['/api/auth/login', '/api/auth/register'];
  if (skipRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Capture the original response methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  // Store request body before processing
  const requestBody = sanitizeData(req.body);
  
  // Override json method to capture response
  res.json = function(body) {
    // Create audit log after response
    const auditLog = {
      userId: req.user?.id || 'anonymous',
      userEmail: req.user?.email || 'anonymous',
      userRole: req.user?.role || 'unknown',
      method: req.method,
      route: req.originalUrl || req.path,
      requestBody: requestBody,
      responseStatus: res.statusCode,
      responseSuccess: body?.success !== false && res.statusCode < 400,
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };
    
    // Don't wait for audit log to complete
    createAuditLog(auditLog);
    
    return originalJson(body);
  };
  
  res.send = function(body) {
    // Only audit if not already done by json()
    if (typeof body === 'string') {
      const auditLog = {
        userId: req.user?.id || 'anonymous',
        userEmail: req.user?.email || 'anonymous',
        userRole: req.user?.role || 'unknown',
        method: req.method,
        route: req.originalUrl || req.path,
        requestBody: requestBody,
        responseStatus: res.statusCode,
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };
      
      createAuditLog(auditLog);
    }
    
    return originalSend(body);
  };
  
  next();
};

/**
 * Log a specific action manually (for custom audit entries)
 */
export const logAuditAction = async (userId, action, details = {}) => {
  await createAuditLog({
    userId,
    action,
    details: sanitizeData(details),
    method: 'CUSTOM',
    route: 'manual-log'
  });
};

export default auditMiddleware;
