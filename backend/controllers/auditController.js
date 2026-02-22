/**
 * Audit Log Controller for CuraOne
 * Handles audit log retrieval and management (admin only)
 */

import { findMany, count } from '../config/database.js';

/**
 * @desc    Get audit logs with pagination and filters
 * @route   GET /api/audit
 * @access  Private (Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      method,
      route,
      startDate,
      endDate,
      success
    } = req.query;

    // Build query
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (method) {
      query.method = method.toUpperCase();
    }

    // Get all logs first (in a real DB this would be done with proper queries)
    let logs = findMany('auditLogs', query, {
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });

    // Apply additional filters that need post-processing
    if (route) {
      logs = logs.filter(log => log.route?.includes(route));
    }

    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      logs = logs.filter(log => new Date(log.timestamp) <= end);
    }

    if (success !== undefined) {
      const successBool = success === 'true';
      logs = logs.filter(log => log.responseSuccess === successBool);
    }

    // Calculate pagination
    const total = logs.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
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
 * @desc    Get audit log statistics
 * @route   GET /api/audit/stats
 * @access  Private (Admin only)
 */
export const getAuditStats = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const logs = findMany('auditLogs');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= cutoffDate);

    // Calculate stats
    const stats = {
      totalLogs: logs.length,
      recentLogs: recentLogs.length,
      byMethod: {},
      byUser: {},
      successRate: 0,
      topRoutes: []
    };

    // Count by method
    recentLogs.forEach(log => {
      stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
      stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
    });

    // Calculate success rate
    const successCount = recentLogs.filter(log => log.responseSuccess).length;
    stats.successRate = recentLogs.length > 0 
      ? Math.round((successCount / recentLogs.length) * 100) 
      : 100;

    // Get top routes
    const routeCounts = {};
    recentLogs.forEach(log => {
      const baseRoute = log.route?.split('?')[0] || 'unknown';
      routeCounts[baseRoute] = (routeCounts[baseRoute] || 0) + 1;
    });
    
    stats.topRoutes = Object.entries(routeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([route, count]) => ({ route, count }));

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs for a specific user
 * @route   GET /api/audit/user/:userId
 * @access  Private (Admin only)
 */
export const getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const logs = findMany('auditLogs', { userId }, {
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });

    const total = logs.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
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

export default {
  getAuditLogs,
  getAuditStats,
  getUserAuditLogs
};
