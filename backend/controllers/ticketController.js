const Ticket = require('../models/Ticket');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private (Admin: all tickets, Contractor: only assigned tickets)
const getTickets = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'Contractor') {
      query.assignedTo = req.user._id;
    }

    // Add filters from query parameters
    const { status, organization, ticketNumber, assignedTo } = req.query;

    if (status) query.status = status;
    if (organization) query.organization = new RegExp(organization, 'i');
    if (ticketNumber) query.ticketNumber = new RegExp(ticketNumber, 'i');

    // Admin can filter by assigned user
    if (req.user.role === 'Admin' && assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortOrder;

    const tickets = await Ticket.find(query)
      .populate('assignedTo', 'firstName lastName email role')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private (Admin: any ticket, Contractor: only assigned tickets)
const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && ticket.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access tickets assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private (Admin: can assign to anyone, Contractor: can only assign to themselves)
const createTicket = async (req, res, next) => {
  try {
    const {
      ticketNumber,
      organization,
      status,
      expirationDate,
      location,
      coordinates,
      addressData,
      notes,
      assignedTo
    } = req.body;

    logger.info(`Creating ticket: ${ticketNumber} by ${req.user.email}`);

    let finalAssignedTo = assignedTo;

    // Handle contractor self-assignment
    if (req.user.role === 'Contractor') {
      // Contractors can only assign tickets to themselves
      finalAssignedTo = req.user._id;
    } else if (req.user.role === 'Admin' && assignedTo) {
      // Admins can assign to anyone, but need to validate the user
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        logger.warn(`Ticket creation failed - User not found: ${assignedTo}`);
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }

      if (!assignedUser.isActive) {
        logger.warn(`Ticket creation failed - Inactive user: ${assignedUser.email}`);
        return res.status(400).json({
          success: false,
          message: 'Cannot assign ticket to inactive user'
        });
      }
    }

    // If no assignedTo provided, assign to the creator
    if (!finalAssignedTo) {
      finalAssignedTo = req.user._id;
    }

    const ticketData = {
      ticketNumber,
      organization,
      status: status || 'Open',
      expirationDate,
      location,
      notes,
      assignedTo: finalAssignedTo
    };

    // Add coordinates and address data if provided
    if (coordinates) {
      ticketData.coordinates = coordinates;
    }
    if (addressData) {
      ticketData.addressData = addressData;
    }

    const ticket = await Ticket.create(ticketData);

    // Populate assigned user data
    await ticket.populate('assignedTo', 'firstName lastName email role');

    logger.info(`Ticket created successfully: ${ticket.ticketNumber} assigned to ${ticket.assignedTo.email}`);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });

  } catch (error) {
    logger.error(`Ticket creation failed: ${error.message}`);
    next(error);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Admin: any ticket, Contractor: only assigned tickets)
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tickets assigned to you'
      });
    }

    const {
      organization,
      location,
      notes,
      assignedTo,
      expirationDate,
      status
    } = req.body;

    // If admin is updating assignment, validate the new assignee
    if (assignedTo && req.user.role === 'Admin') {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
      if (!assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign ticket to inactive user'
        });
      }
      ticket.assignedTo = assignedTo;
    }

    // Update allowed fields
    if (organization !== undefined) ticket.organization = organization;
    if (location !== undefined) ticket.location = location;
    if (notes !== undefined) ticket.notes = notes;
    if (expirationDate !== undefined) ticket.expirationDate = new Date(expirationDate);
    if (status !== undefined) {
      // Validate status value
      const validStatuses = ['Open', 'Closed', 'Expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: Open, Closed, Expired'
        });
      }
      ticket.status = status;
    }

    await ticket.save();
    await ticket.populate('assignedTo', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Renew ticket (extend expiration date)
// @route   PUT /api/tickets/:id/renew
// @access  Private (Admin: any ticket, Contractor: only assigned tickets)
const renewTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      logger.warn(`Ticket renewal failed - Ticket not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && ticket.assignedTo.toString() !== req.user._id.toString()) {
      logger.warn(`Ticket renewal failed - Unauthorized access by ${req.user.email} to ticket ${ticket.ticketNumber}`);
      return res.status(403).json({
        success: false,
        message: 'You can only renew tickets assigned to you'
      });
    }

    const daysToExtend = req.body.days || 15;

    logger.info(`Renewing ticket: ${ticket.ticketNumber} by ${req.user.email} for ${daysToExtend} days`);

    // Renew the ticket
    await ticket.renew(daysToExtend);

    // Create renewal alert
    await Alert.create({
      ticketId: ticket._id,
      type: 'renewed',
      message: `Ticket renewed for ${daysToExtend} days. New expiration: ${ticket.expirationDate.toLocaleDateString()}`,
      severity: 'low'
    });

    await ticket.populate('assignedTo', 'firstName lastName email role');

    logger.info(`Ticket renewed successfully: ${ticket.ticketNumber} extended by ${daysToExtend} days`);

    res.status(200).json({
      success: true,
      message: `Ticket renewed for ${daysToExtend} days`,
      data: ticket
    });

  } catch (error) {
    logger.error(`Ticket renewal failed: ${error.message}`);
    next(error);
  }
};

// @desc    Close ticket
// @route   PUT /api/tickets/:id/close
// @access  Private (Admin: any ticket, Contractor: only assigned tickets)
const closeTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if contractor is assigned to this ticket
    if (req.user.role === 'Contractor' && ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only close tickets assigned to you'
      });
    }

    await ticket.close();

    // Create closure alert
    await Alert.create({
      ticketId: ticket._id,
      type: 'closed',
      message: 'Ticket has been closed',
      severity: 'low'
    });

    await ticket.populate('assignedTo', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      data: ticket
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private (Admin: all stats, Contractor: only their stats)
const getTicketStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    // Filter based on user role
    if (req.user.role === 'Contractor') {
      matchQuery.assignedTo = req.user._id;
    }

    const stats = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get expiring soon count (next 48 hours)
    const expiringSoonQuery = {
      ...matchQuery,
      status: 'Open',
      expirationDate: {
        $lte: new Date(Date.now() + 48 * 60 * 60 * 1000),
        $gt: new Date()
      }
    };

    const expiringSoon = await Ticket.countDocuments(expiringSoonQuery);

    // Format stats
    const formattedStats = {
      total: 0,
      open: 0,
      closed: 0,
      expired: 0,
      expiringSoon
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id.toLowerCase()] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Generate next ticket number
// @route   GET /api/tickets/generate-number
// @access  Private
const generateTicketNumber = async (req, res, next) => {
  try {
    const ticketNumber = await Ticket.generateTicketNumber();
    
    res.status(200).json({
      success: true,
      data: {
        ticketNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if ticket number exists
// @route   GET /api/tickets/check-number/:ticketNumber
// @access  Private
const checkTicketNumber = async (req, res, next) => {
  try {
    const { ticketNumber } = req.params;
    
    const existingTicket = await Ticket.findOne({ 
      ticketNumber: ticketNumber.toUpperCase() 
    });
    
    res.status(200).json({
      success: true,
      data: {
        exists: !!existingTicket,
        available: !existingTicket
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import tickets from JSON data
// @route   POST /api/tickets/import
// @access  Private (Admin: can import any tickets, Contractor: can only import for themselves)
const importTickets = async (req, res, next) => {
  try {
    const { tickets, overwriteExisting = false } = req.body;
    
    if (!tickets || !Array.isArray(tickets)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tickets data. Expected an array of tickets.'
      });
    }

    logger.info(`Importing ${tickets.length} tickets by ${req.user.email}`);

    const results = {
      imported: [],
      skipped: [],
      errors: [],
      duplicates: []
    };

    for (const ticketData of tickets) {
      try {
        // Validate required fields
        if (!ticketData.ticketNumber || !ticketData.organization) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber || 'Unknown',
            error: 'Missing required fields: ticketNumber and organization are required'
          });
          continue;
        }

        // Check for existing ticket
        const existingTicket = await Ticket.findOne({ 
          ticketNumber: ticketData.ticketNumber.toUpperCase() 
        });

        if (existingTicket) {
          if (overwriteExisting) {
            // Update existing ticket
            const updatedTicket = await Ticket.findByIdAndUpdate(
              existingTicket._id,
              {
                ...ticketData,
                ticketNumber: ticketData.ticketNumber.toUpperCase(),
                assignedTo: req.user.role === 'Contractor' ? req.user._id : (ticketData.assignedTo || req.user._id),
                updatedAt: new Date()
              },
              { new: true, runValidators: true }
            ).populate('assignedTo', 'firstName lastName email role');

            results.imported.push({
              ticketNumber: ticketData.ticketNumber,
              action: 'updated',
              data: updatedTicket
            });

            logger.info(`Updated existing ticket: ${ticketData.ticketNumber}`);
          } else {
            // Skip duplicate
            results.duplicates.push({
              ticketNumber: ticketData.ticketNumber,
              existingTicket: existingTicket
            });
            logger.info(`Skipped duplicate ticket: ${ticketData.ticketNumber}`);
          }
        } else {
          // Create new ticket
          const newTicket = await Ticket.create({
            ...ticketData,
            ticketNumber: ticketData.ticketNumber.toUpperCase(),
            assignedTo: req.user.role === 'Contractor' ? req.user._id : (ticketData.assignedTo || req.user._id)
          });

          await newTicket.populate('assignedTo', 'firstName lastName email role');

          results.imported.push({
            ticketNumber: ticketData.ticketNumber,
            action: 'created',
            data: newTicket
          });

          logger.info(`Created new ticket: ${ticketData.ticketNumber}`);
        }
      } catch (error) {
        logger.error(`Error processing ticket ${ticketData.ticketNumber}:`, error);
        results.errors.push({
          ticketNumber: ticketData.ticketNumber,
          error: error.message
        });
      }
    }

    logger.info(`Import completed: ${results.imported.length} imported, ${results.duplicates.length} duplicates, ${results.errors.length} errors`);

    res.status(200).json({
      success: true,
      message: `Import completed: ${results.imported.length} tickets processed`,
      data: results
    });

  } catch (error) {
    logger.error(`Ticket import failed: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  renewTicket,
  closeTicket,
  getTicketStats,
  generateTicketNumber,
  checkTicketNumber,
  importTickets
};
