const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token is invalid.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.'
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user has required role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not found'
      });
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin
};
