const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation failed for ${req.method} ${req.url}:`, {
      errors: errors.array(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Sanitize string inputs
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[<>]/g, ''); // Basic XSS prevention
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('role')
    .optional()
    .isIn(['Admin', 'Contractor'])
    .withMessage('Role must be either Admin or Contractor'),

  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

/**
 * Password update validation
 */
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];

/**
 * Profile update validation
 */
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  handleValidationErrors
];

/**
 * User ID parameter validation
 */
const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  handleValidationErrors
];

/**
 * User update validation (Admin only)
 */
const validateUserUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('role')
    .optional()
    .isIn(['Admin', 'Contractor'])
    .withMessage('Role must be either Admin or Contractor'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  handleValidationErrors
];

/**
 * Ticket creation validation
 */
const validateTicketCreation = [
  body('ticketNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ticket number must be between 1 and 50 characters')
    .matches(/^[A-Z0-9\-_\s]+$/)
    .withMessage('Ticket number can only contain letters, numbers, hyphens, underscores, and spaces'),

  body('organization')
    .trim()
    .notEmpty()
    .withMessage('Organization is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization must be between 1 and 100 characters'),

  body('expirationDate')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ObjectId'),

  body('status')
    .optional()
    .isIn(['Open', 'Closed', 'Expired'])
    .withMessage('Status must be one of: Open, Closed, Expired'),

  body('coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object'),

  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('addressData')
    .optional()
    .isObject()
    .withMessage('Address data must be an object'),

  handleValidationErrors
];

/**
 * Ticket update validation
 */
const validateTicketUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID format'),

  body('organization')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization must be between 1 and 100 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ObjectId'),

  body('expirationDate')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),

  body('status')
    .optional()
    .isIn(['Open', 'Closed', 'Expired'])
    .withMessage('Status must be one of: Open, Closed, Expired'),

  handleValidationErrors
];

/**
 * Ticket ID parameter validation
 */
const validateTicketId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID format'),

  handleValidationErrors
];

/**
 * Ticket renewal validation
 */
const validateTicketRenewal = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID format'),

  body('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),

  handleValidationErrors
];

/**
 * Query parameters validation for ticket listing
 */
const validateTicketQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['Open', 'Closed', 'Expired'])
    .withMessage('Status must be Open, Closed, or Expired'),

  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ObjectId'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'expirationDate', 'ticketNumber', 'status'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  handleValidationErrors
];

/**
 * Pagination query validation
 */
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateUserId,
  validateUserUpdate,
  validateTicketCreation,
  validateTicketUpdate,
  validateTicketId,
  validateTicketRenewal,
  validateTicketQuery,
  validatePaginationQuery
};
