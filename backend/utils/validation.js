import validator from 'validator';

// Email validation
export const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Password validation - at least 8 chars, uppercase, lowercase, number, special char
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone validation
export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

// Validate date format
export const validateDate = (dateString) => {
  return validator.isISO8601(dateString);
};

// Validate positive number
export const validatePositiveNumber = (value) => {
  return typeof value === 'number' && value > 0;
};

// Validate enum values
export const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Validate session duration (in minutes, between 30 and 240)
export const validateSessionDuration = (duration) => {
  return typeof duration === 'number' && duration >= 30 && duration <= 240;
};

// Validate therapy type
export const validateTherapyType = (type) => {
  const allowedTypes = [
    'panchakarma',
    'abhyanga',
    'shirodhara',
    'swedana',
    'basti',
    'nasya',
    'raktamokshana',
    'consultation',
    'follow-up'
  ];
  return allowedTypes.includes(type);
};

// Validate user role
export const validateUserRole = (role) => {
  const allowedRoles = ['patient', 'practitioner', 'admin'];
  return allowedRoles.includes(role);
};

// Validate session status
export const validateSessionStatus = (status) => {
  const allowedStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
  return allowedStatuses.includes(status);
};

// Validate wellness metric type
export const validateWellnessMetricType = (type) => {
  const allowedTypes = ['energy', 'mood', 'sleep', 'stress', 'pain', 'digestion', 'overall'];
  return allowedTypes.includes(type);
};

// Validate rating (1-5 or 1-10)
export const validateRating = (rating, max = 5) => {
  return typeof rating === 'number' && rating >= 1 && rating <= max;
};

// Validate notification type
export const validateNotificationType = (type) => {
  const allowedTypes = ['appointment', 'reminder', 'wellness', 'system', 'promotion'];
  return allowedTypes.includes(type);
};

// Validate notification priority
export const validateNotificationPriority = (priority) => {
  const allowedPriorities = ['low', 'normal', 'high', 'urgent'];
  return allowedPriorities.includes(priority);
};

// Comprehensive input validation
export const validateBookingRequest = (data) => {
  const errors = [];

  if (!data.therapyId) errors.push('Therapy ID is required');
  if (!data.practitionerId) errors.push('Practitioner ID is required');
  if (!data.preferredDate) errors.push('Preferred date is required');
  if (!data.preferredTime) errors.push('Preferred time is required');

  if (data.preferredDate && !validateDate(data.preferredDate)) {
    errors.push('Invalid date format');
  }

  if (data.duration && !validateSessionDuration(data.duration)) {
    errors.push('Session duration must be between 30 and 240 minutes');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate wellness check-in data
export const validateWellnessCheckIn = (data) => {
  const errors = [];

  if (!data.metrics || !Array.isArray(data.metrics)) {
    errors.push('Wellness metrics are required');
  } else {
    data.metrics.forEach((metric, index) => {
      if (!metric.type || !validateWellnessMetricType(metric.type)) {
        errors.push(`Invalid metric type at index ${index}`);
      }
      if (metric.value === undefined || !validateRating(metric.value, 10)) {
        errors.push(`Invalid metric value at index ${index} (must be 1-10)`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate feedback data
export const validateFeedback = (data) => {
  const errors = [];

  if (!data.sessionId) errors.push('Session ID is required');
  if (!data.rating || !validateRating(data.rating, 5)) {
    errors.push('Rating is required and must be between 1-5');
  }
  
  if (data.comment && data.comment.length > 1000) {
    errors.push('Comment must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate notification data
export const validateNotification = (data) => {
  const errors = [];

  if (!data.recipientId) errors.push('Recipient ID is required');
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Notification title is required');
  }
  if (!data.message || data.message.trim().length === 0) {
    errors.push('Notification message is required');
  }
  
  if (data.type && !validateNotificationType(data.type)) {
    errors.push('Invalid notification type');
  }
  
  if (data.priority && !validateNotificationPriority(data.priority)) {
    errors.push('Invalid notification priority');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};