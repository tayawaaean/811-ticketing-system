const mongoose = require('mongoose');

const renewalSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  extendedBy: {
    type: Number, // days extended
    required: true
  }
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: [true, 'Ticket number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Expired'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  renewals: [renewalSchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned contractor is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ expirationDate: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Virtual for checking if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
  return this.status === 'Expired' || new Date() > this.expirationDate;
});

// Virtual for days until expiration
ticketSchema.virtual('daysUntilExpiration').get(function() {
  if (this.status === 'Expired') return 0;
  const now = new Date();
  const diffTime = this.expirationDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Method to renew ticket
ticketSchema.methods.renew = function(days = 15) {
  const newExpirationDate = new Date(this.expirationDate);
  newExpirationDate.setDate(newExpirationDate.getDate() + days);

  this.expirationDate = newExpirationDate;
  this.renewals.push({
    date: new Date(),
    extendedBy: days
  });

  // If ticket was expired, set it back to Open
  if (this.status === 'Expired') {
    this.status = 'Open';
  }

  return this.save();
};

// Method to close ticket
ticketSchema.methods.close = function() {
  this.status = 'Closed';
  return this.save();
};

// Method to expire ticket
ticketSchema.methods.expire = function() {
  this.status = 'Expired';
  return this.save();
};

// Static method to find tickets expiring soon
ticketSchema.statics.findExpiringSoon = function(hours = 48) {
  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + hours);

  return this.find({
    status: { $in: ['Open'] },
    expirationDate: {
      $lte: futureDate,
      $gt: new Date()
    }
  }).populate('assignedTo', 'firstName lastName email');
};

// Static method to find expired tickets
ticketSchema.statics.findExpired = function() {
  return this.find({
    status: { $in: ['Open'] },
    expirationDate: { $lt: new Date() }
  }).populate('assignedTo', 'firstName lastName email');
};

// Static method to generate next ticket number
ticketSchema.statics.generateTicketNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `TKT-${currentYear}`;
  
  // Find the highest ticket number for this year
  const lastTicket = await this.findOne({
    ticketNumber: { $regex: `^${prefix}-` }
  }).sort({ ticketNumber: -1 });
  
  let nextNumber = 1;
  if (lastTicket) {
    // Extract the number from the last ticket (e.g., "TKT-2024-0015" -> 15)
    const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Format with leading zeros (4 digits)
  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
};

// Pre-save middleware to auto-generate ticket number if not provided
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    try {
      this.ticketNumber = await this.constructor.generateTicketNumber();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
