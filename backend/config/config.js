require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketing_system',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Security Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001',
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || '10mb',

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10, // 10 auth requests per window
  STRICT_RATE_LIMIT_MAX: parseInt(process.env.STRICT_RATE_LIMIT_MAX) || 20, // 20 requests per 5 minutes

  // Admin Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@novaunderground.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123'
};
