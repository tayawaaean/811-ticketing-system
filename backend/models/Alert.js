const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket ID is required']
  },
  type: {
    type: String,
    enum: ['expiring_soon', 'expired', 'renewed', 'closed'],
    required: [true, 'Alert type is required']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ ticketId: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ isRead: 1 });

// Virtual for formatted date
alertSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

// Method to mark as read
alertSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Static method to get unread alerts
alertSchema.statics.getUnreadAlerts = function(limit = 50) {
  return this.find({ isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('ticketId', 'ticketNumber organization status expirationDate');
};

// Static method to get alerts by type
alertSchema.statics.getAlertsByType = function(type, limit = 50) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('ticketId', 'ticketNumber organization status expirationDate');
};

// Static method to create expiration alert
alertSchema.statics.createExpirationAlert = function(ticketId, hoursUntilExpiration) {
  let type, message, severity;

  if (hoursUntilExpiration <= 0) {
    type = 'expired';
    message = 'Ticket has expired and been automatically marked as expired';
    severity = 'critical';
  } else if (hoursUntilExpiration <= 24) {
    type = 'expiring_soon';
    message = `Ticket will expire in ${hoursUntilExpiration} hours`;
    severity = 'high';
  } else {
    type = 'expiring_soon';
    message = `Ticket will expire in ${Math.ceil(hoursUntilExpiration / 24)} days`;
    severity = 'medium';
  }

  return this.create({
    ticketId,
    type,
    message,
    severity
  });
};

module.exports = mongoose.model('Alert', alertSchema);
