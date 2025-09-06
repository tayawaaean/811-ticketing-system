const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const config = require('../config/config');
const { logger } = require('../utils/logger');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic system status and information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 */
router.get('/', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'OK',
    message: 'Nova Underground LLC API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

/**
 * @swagger
 * /api/health/database:
 *   get:
 *     summary: Database health check
 *     description: Tests MongoDB connectivity and returns connection details
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseHealthResponse'
 *       503:
 *         description: Database connection failed
 */
router.get('/database', async (req, res) => {
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'OK',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
      database: {
        name: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/health/system:
 *   get:
 *     summary: System health check
 *     description: Returns system metrics including memory usage, uptime, and platform information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemHealthResponse'
 */
router.get('/system', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    status: 'OK',
    message: 'System health check',
    timestamp: new Date().toISOString(),
    system: {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      },
      platform: process.platform,
      nodeVersion: process.version,
      environment: config.NODE_ENV
    }
  });
});

/**
 * @swagger
 * /api/health/comprehensive:
 *   get:
 *     summary: Comprehensive health check
 *     description: Tests all system components (database, system, application) and returns aggregated health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComprehensiveHealthResponse'
 *       503:
 *         description: One or more systems unhealthy
 */
router.get('/comprehensive', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // Database check
    await mongoose.connection.db.admin().ping();
    health.checks.database = { status: 'OK', message: 'Connected' };
  } catch (error) {
    health.checks.database = { status: 'ERROR', message: error.message };
    health.status = 'DEGRADED';
  }

  // System check
  const memUsage = process.memoryUsage();
  health.checks.system = {
    status: 'OK',
    uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
    memoryUsage: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
  };

  // Application check
  health.checks.application = {
    status: 'OK',
    environment: config.NODE_ENV,
    version: '1.0.0'
  };

  if (health.status !== 'OK') {
    res.status(503);
  }

  res.json(health);
});

/**
 * @swagger
 * /api/health/auth:
 *   get:
 *     summary: Authentication health check
 *     description: Validates authentication system and returns user statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Authentication system is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthHealthResponse'
 *       503:
 *         description: Authentication system check failed
 */
router.get('/auth', async (req, res) => {
  try {
    // Check if we can query users (tests auth system)
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'Admin' });

    res.json({
      status: 'OK',
      message: 'Authentication system is healthy',
      timestamp: new Date().toISOString(),
      auth: {
        totalUsers: userCount,
        adminUsers: adminCount,
        jwtSecretConfigured: !!config.JWT_SECRET,
        jwtExpireConfigured: !!config.JWT_EXPIRE
      }
    });
  } catch (error) {
    logger.error('Auth health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Authentication system check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/health/business:
 *   get:
 *     summary: Business logic health check
 *     description: Returns ticket statistics and business logic health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Business logic is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessHealthResponse'
 *       503:
 *         description: Business logic check failed
 */
router.get('/business', async (req, res) => {
  try {
    // Check ticket counts and system health
    const totalTickets = await Ticket.countDocuments();
    const activeTickets = await Ticket.countDocuments({ status: 'Open' });
    const expiringSoon = await Ticket.countDocuments({
      status: 'Open',
      expirationDate: {
        $lte: new Date(Date.now() + 48 * 60 * 60 * 1000), // Next 48 hours
        $gt: new Date()
      }
    });

    res.json({
      status: 'OK',
      message: 'Business logic is healthy',
      timestamp: new Date().toISOString(),
      business: {
        totalTickets,
        activeTickets,
        expiringSoon,
        expirationMonitorActive: true // Monitor runs automatically on startup
      }
    });
  } catch (error) {
    logger.error('Business health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Business logic check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes/Docker readiness probe - checks if service is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessHealthResponse'
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'READY',
      message: 'Service is ready to accept traffic',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes/Docker liveness probe - checks if service is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivenessHealthResponse'
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'ALIVE',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

module.exports = router;
