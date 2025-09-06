const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

// Import logger
const { logger, logRequest } = require('./utils/logger');

// Import Swagger
const { swaggerUi, swaggerSpec } = require('./utils/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const alertRoutes = require('./routes/alerts');
const importRoutes = require('./routes/import');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler } = require('./middlewares/errorHandler');
const { securityMiddleware } = require('./middlewares/security');

// Import utils
const { startExpirationMonitor } = require('./utils/expirationMonitor');

const app = express();

// Log application startup
logger.info('🚀 Starting Nova Underground LLC Backend');

// Apply security middleware FIRST (before other middleware)
securityMiddleware(app);

// Additional middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(logRequest);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/import', importRoutes);
app.use('/api/health', healthRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
logger.info('📡 Connecting to MongoDB...');
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ Connected to MongoDB successfully');
  // Start the expiration monitoring job
  startExpirationMonitor();
})
.catch((error) => {
  logger.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  logger.info(`🌐 Server is running on port ${PORT}`);
  logger.info(`🔧 Environment: ${config.NODE_ENV}`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info('✅ Nova Underground LLC Backend is ready!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;
