const Alert = require('../models/Alert');
const { logger } = require('../utils/logger');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private (Admin: all alerts, Contractor: only assigned ticket alerts)
const getAlerts = async (req, res, next) => {
  try {
    logger.info(`Getting alerts for ${req.user.role}: ${req.user.email}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {};
    let totalQuery = {};

    // Filter based on user role
    if (req.user.role === 'Contractor') {
      // For contractors, only show alerts for tickets assigned to them
      const Ticket = require('../models/Ticket');
      const assignedTicketIds = await Ticket.find({ assignedTo: req.user._id }).select('_id');
      const ticketIds = assignedTicketIds.map(ticket => ticket._id);
      
      query.ticketId = { $in: ticketIds };
      totalQuery.ticketId = { $in: ticketIds };
    }

    const alerts = await Alert.find(query)
      .populate('ticketId', 'ticketNumber organization status expirationDate assignedTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Alert.countDocuments(totalQuery);

    logger.info(`Found ${alerts.length} alerts for ${req.user.role}`);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      alerts
    });

  } catch (error) {
    logger.error('Error getting alerts:', error);
    next(error);
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private (Admin: any alert, Contractor: only assigned ticket alerts)
const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('ticketId', 'ticketNumber organization status expirationDate assignedTo');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && alert.ticketId.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access alerts for tickets assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      alert
    });

  } catch (error) {
    logger.error('Error getting alert:', error);
    next(error);
  }
};

// @desc    Update alert (mark as read/unread)
// @route   PUT /api/alerts/:id
// @access  Private (Admin: any alert, Contractor: only assigned ticket alerts)
const updateAlert = async (req, res, next) => {
  try {
    const { isRead } = req.body;

    const alert = await Alert.findById(req.params.id)
      .populate('ticketId', 'assignedTo');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && alert.ticketId.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update alerts for tickets assigned to you'
      });
    }

    alert.isRead = isRead !== undefined ? isRead : alert.isRead;
    await alert.save();

    logger.info(`Alert ${alert._id} updated by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Alert marked as ${alert.isRead ? 'read' : 'unread'}`,
      alert
    });

  } catch (error) {
    logger.error('Error updating alert:', error);
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.remove();

    logger.info(`Alert ${alert._id} deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting alert:', error);
    next(error);
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/mark-all-read
// @access  Private (Admin: all alerts, Contractor: only assigned ticket alerts)
const markAllAsRead = async (req, res, next) => {
  try {
    let query = { isRead: false };

    // Filter based on user role
    if (req.user.role === 'Contractor') {
      // For contractors, only mark alerts for tickets assigned to them as read
      const Ticket = require('../models/Ticket');
      const assignedTicketIds = await Ticket.find({ assignedTo: req.user._id }).select('_id');
      const ticketIds = assignedTicketIds.map(ticket => ticket._id);
      
      query.ticketId = { $in: ticketIds };
    }

    const result = await Alert.updateMany(query, { isRead: true });

    logger.info(`${result.modifiedCount} alerts marked as read by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} alerts marked as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    logger.error('Error marking all alerts as read:', error);
    next(error);
  }
};

// @desc    Get alerts statistics
// @route   GET /api/alerts/stats
// @access  Private (Admin: all alerts, Contractor: only assigned ticket alerts)
const getAlertsStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    // Filter based on user role
    if (req.user.role === 'Contractor') {
      // For contractors, only count alerts for tickets assigned to them
      const Ticket = require('../models/Ticket');
      const assignedTicketIds = await Ticket.find({ assignedTo: req.user._id }).select('_id');
      const ticketIds = assignedTicketIds.map(ticket => ticket._id);
      
      matchQuery.ticketId = { $in: ticketIds };
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
          }
        }
      }
    ];

    const stats = await Alert.aggregate(pipeline);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });

  } catch (error) {
    logger.error('Error getting alerts stats:', error);
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  markAllAsRead,
  getAlertsStats
};
