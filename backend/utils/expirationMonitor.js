const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const Alert = require('../models/Alert');
const { logger } = require('./logger');

// Check for tickets expiring soon and create alerts
const checkExpiringTickets = async () => {
  try {
    logger.info('🔍 Checking for tickets expiring soon...');

    // Find tickets expiring in the next 48 hours
    const expiringTickets = await Ticket.findExpiringSoon(48);

    for (const ticket of expiringTickets) {
      const hoursUntilExpiration = (ticket.expirationDate - new Date()) / (1000 * 60 * 60);

      // Create alert if one doesn't exist for this ticket in the last 24 hours
      const recentAlert = await Alert.findOne({
        ticketId: ticket._id,
        type: 'expiring_soon',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!recentAlert) {
        await Alert.createExpirationAlert(ticket._id, hoursUntilExpiration);
        logger.info(`🚨 Alert created for ticket ${ticket.ticketNumber} expiring in ${Math.ceil(hoursUntilExpiration)} hours`);
      }
    }

    logger.info(`📊 Found ${expiringTickets.length} tickets expiring soon`);

  } catch (error) {
    logger.error('❌ Error checking expiring tickets:', error);
  }
};

// Automatically expire tickets that have passed their expiration date
const expireTickets = async () => {
  try {
    logger.info('⏰ Checking for expired tickets...');

    // Find tickets that have expired
    const expiredTickets = await Ticket.findExpired();

    for (const ticket of expiredTickets) {
      await ticket.expire();

      // Create expiration alert
      await Alert.createExpirationAlert(ticket._id, 0);

      logger.warn(`⚠️ Ticket ${ticket.ticketNumber} has been automatically expired`);
    }

    logger.info(`📈 Expired ${expiredTickets.length} tickets`);

  } catch (error) {
    logger.error('❌ Error expiring tickets:', error);
  }
};

// Run comprehensive expiration check (both expiring soon and expired)
const runExpirationCheck = async () => {
  try {
    logger.info('🔄 Running comprehensive expiration check...');
    await checkExpiringTickets();
    await expireTickets();
    logger.info('✅ Expiration check completed');
  } catch (error) {
    logger.error('❌ Error in expiration check:', error);
  }
};

// Start the expiration monitoring system
const startExpirationMonitor = () => {
  logger.info('🚀 Starting expiration monitoring system...');

  // Run initial check
  runExpirationCheck();

  // Schedule checks every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    logger.info('⏰ Running scheduled expiration check...');
    runExpirationCheck();
  });

  // Alternative: Run every hour for less frequent monitoring
  // cron.schedule('0 * * * *', runExpirationCheck);

  // Alternative: Run daily at 9 AM
  // cron.schedule('0 9 * * *', runExpirationCheck);

  logger.info('✅ Expiration monitoring system started successfully');
};

// Manual trigger for testing (can be called from routes if needed)
const triggerExpirationCheck = async (req, res) => {
  try {
    await runExpirationCheck();
    res.status(200).json({
      success: true,
      message: 'Expiration check completed manually'
    });
  } catch (error) {
    console.error('Manual expiration check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running manual expiration check'
    });
  }
};

module.exports = {
  startExpirationMonitor,
  runExpirationCheck,
  triggerExpirationCheck,
  checkExpiringTickets,
  expireTickets
};
