const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');
const cors = require('cors');
const { logger } = require('../utils/logger');

/**
 * Security middleware configuration for production readiness
 */

// Rate limiting configurations
const createRateLimit = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: `Too many requests from this IP, please try again after ${Math.ceil(options.windowMs / 1000 / 60)} minutes.`,
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
      res.status(429).json({
        success: false,
        message: `Too many requests from this IP, please try again after ${Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000 / 60)} minutes.`,
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.url === '/api/health';
    }
  });
};

// Different rate limit tiers
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 API requests per windowMs
});

const strictRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20 // limit each IP to 20 requests per 5 minutes for sensitive operations
});

// Slow down configuration for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes without delay
  delayMs: 500, // add 500ms of delay per request after delayAfter
  maxDelayMs: 20000, // maximum delay of 20 seconds
  skipFailedRequests: true, // don't slow down failed requests
  skipSuccessfulRequests: true, // don't slow down successful requests
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.CORS_ORIGIN ?
      process.env.CORS_ORIGIN.split(',') :
      ['http://localhost:3000', 'http://localhost:3001'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

// Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Compression configuration
const compressionConfig = {
  level: 6, // compression level (1-9, 6 is good balance)
  threshold: 1024, // only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
};

/**
 * Apply all security middleware to the Express app
 */
const securityMiddleware = (app) => {
  logger.info('🔒 Applying security middleware...');

  // 1. Security headers (Helmet)
  app.use(helmet(helmetConfig));
  logger.info('✅ Helmet security headers applied');

  // 2. Compression
  app.use(compression(compressionConfig));
  logger.info('✅ Response compression enabled');

  // 3. CORS
  app.use(cors(corsOptions));
  logger.info('✅ CORS configured');

  // 4. Trust proxy (important for rate limiting behind load balancers)
  app.set('trust proxy', 1);

  // 5. Request size limits
  app.use(express.json({
    limit: process.env.REQUEST_SIZE_LIMIT || '10mb',
    strict: true
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: process.env.REQUEST_SIZE_LIMIT || '10mb'
  }));

  // 6. Rate limiting - skip in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment) {
    app.use('/api/auth', authRateLimit); // Stricter limits for auth
    app.use('/api', apiRateLimit); // Standard limits for API
    app.use('/api-docs', strictRateLimit); // Limits for documentation
    // 7. Speed limiting for abuse prevention
    app.use(speedLimiter);
    logger.info('✅ Rate limiting and speed limiting enabled');
  } else {
    logger.info('🚫 Rate limiting and speed limiting disabled (development mode)');
  }

  logger.info('🚀 Security middleware fully configured');
};

/**
 * Export individual middleware for custom usage
 */
module.exports = {
  securityMiddleware,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  speedLimiter,
  corsOptions,
  helmetConfig,
  compressionConfig
};
