const fs = require('fs').promises;
const path = require('path');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Import tickets from JSON file
// @route   POST /api/import/tickets
// @access  Private/Admin
const importTickets = async (req, res, next) => {
  try {
    console.log('Import request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request file:', req.file);

    // Check if file was uploaded
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a JSON file.'
      });
    }

    let ticketsData;
    try {
      console.log('File received:', req.file);
      console.log('File size:', req.file.size);
      console.log('File mimetype:', req.file.mimetype);

      const fileContent = req.file.buffer.toString('utf8');
      console.log('File content length:', fileContent.length);
      console.log('File content preview:', fileContent.substring(0, 200));

      // Try to parse JSON
      ticketsData = JSON.parse(fileContent);
      console.log('Parsed tickets count:', Array.isArray(ticketsData) ? ticketsData.length : 'Not an array');

      // Validate it's an array
      if (!Array.isArray(ticketsData)) {
        return res.status(400).json({
          success: false,
          message: 'JSON file must contain an array of ticket objects'
        });
      }

    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Error details:', error.message);
      return res.status(400).json({
        success: false,
        message: `Invalid JSON format in uploaded file: ${error.message}`
      });
    }

    const results = {
      total: ticketsData.length,
      successful: 0,
      failed: 0,
      updated: 0,
      errors: []
    };

    // Process each ticket
    console.log(`Processing ${ticketsData.length} tickets...`);
    for (const ticketData of ticketsData) {
      console.log(`Processing ticket: ${ticketData.ticketNumber}`);
      try {
        // Validate required fields
        const requiredFields = ['ticketNumber', 'organization', 'expirationDate', 'location', 'assignedTo'];
        const missingFields = requiredFields.filter(field => !ticketData[field]);

        if (missingFields.length > 0) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber || 'Unknown',
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          results.failed++;
          continue;
        }

        // Find the assigned user by email
        console.log(`Looking for user with email: ${ticketData.assignedTo}`);
        const assignedUser = await User.findOne({ email: ticketData.assignedTo });
        console.log(`User found:`, assignedUser ? assignedUser.email : 'NOT FOUND');

        if (!assignedUser) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber,
            error: `Assigned user with email ${ticketData.assignedTo} not found`
          });
          results.failed++;
          continue;
        }

        // Check if ticket already exists
        const existingTicket = await Ticket.findOne({ ticketNumber: ticketData.ticketNumber });
        if (existingTicket) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber,
            error: 'Ticket with this number already exists'
          });
          results.failed++;
          continue;
        }

        // Validate status
        const validStatuses = ['Open', 'Closed', 'Expired'];
        if (ticketData.status && !validStatuses.includes(ticketData.status)) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber,
            error: `Invalid status: ${ticketData.status}. Must be one of: ${validStatuses.join(', ')}`
          });
          results.failed++;
          continue;
        }

        // Validate expiration date
        const expirationDate = new Date(ticketData.expirationDate);
        if (isNaN(expirationDate.getTime())) {
          results.errors.push({
            ticketNumber: ticketData.ticketNumber,
            error: 'Invalid expiration date format'
          });
          results.failed++;
          continue;
        }

        // Create the ticket
        console.log(`Creating ticket: ${ticketData.ticketNumber}`);
        const ticket = await Ticket.create({
          ticketNumber: ticketData.ticketNumber,
          organization: ticketData.organization,
          status: ticketData.status || 'Open',
          expirationDate: expirationDate,
          location: ticketData.location,
          notes: ticketData.notes || '',
          assignedTo: assignedUser._id
        });
        console.log(`Ticket created successfully: ${ticket._id}`);

        results.successful++;

      } catch (error) {
        results.errors.push({
          ticketNumber: ticketData.ticketNumber || 'Unknown',
          error: error.message
        });
        results.failed++;
      }
    }

    console.log(`Import completed. Results:`, {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors
    });

    res.status(200).json({
      success: true,
      message: `Import completed. ${results.successful} tickets imported, ${results.failed} failed`,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get import status/preview
// @route   GET /api/import/preview
// @access  Private/Admin
const getImportPreview = async (req, res, next) => {
  try {
    // Read the tickets.json file
    const filePath = path.join(__dirname, '..', 'tickets.json');

    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'tickets.json file not found in project root'
      });
    }

    let ticketsData;
    try {
      ticketsData = JSON.parse(fileContent);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in tickets.json file'
      });
    }

    if (!Array.isArray(ticketsData)) {
      return res.status(400).json({
        success: false,
        message: 'tickets.json must contain an array of ticket objects'
      });
    }

    // Get all users for validation
    const users = await User.find({}, 'email firstName lastName role');
    const userEmails = users.map(user => user.email);

    // Analyze the data
    const analysis = {
      totalTickets: ticketsData.length,
      validTickets: 0,
      invalidTickets: 0,
      existingTickets: 0,
      issues: [],
      userMapping: {}
    };

    for (const ticketData of ticketsData) {
      let isValid = true;
      const issues = [];

      // Check required fields
      const requiredFields = ['ticketNumber', 'organization', 'expirationDate', 'location', 'assignedTo'];
      const missingFields = requiredFields.filter(field => !ticketData[field]);

      if (missingFields.length > 0) {
        issues.push(`Missing required fields: ${missingFields.join(', ')}`);
        isValid = false;
      }

      // Check if user exists
      if (ticketData.assignedTo && !userEmails.includes(ticketData.assignedTo)) {
        issues.push(`Assigned user ${ticketData.assignedTo} not found in system`);
        isValid = false;
      }

      // Check if ticket already exists
      const existingTicket = await Ticket.findOne({ ticketNumber: ticketData.ticketNumber });
      if (existingTicket) {
        issues.push('Ticket number already exists');
        analysis.existingTickets++;
        isValid = false;
      }

      // Check status validity
      const validStatuses = ['Open', 'Closed', 'Expired'];
      if (ticketData.status && !validStatuses.includes(ticketData.status)) {
        issues.push(`Invalid status: ${ticketData.status}`);
        isValid = false;
      }

      // Check expiration date validity
      if (ticketData.expirationDate) {
        const expirationDate = new Date(ticketData.expirationDate);
        if (isNaN(expirationDate.getTime())) {
          issues.push('Invalid expiration date format');
          isValid = false;
        }
      }

      if (isValid) {
        analysis.validTickets++;
      } else {
        analysis.invalidTickets++;
        analysis.issues.push({
          ticketNumber: ticketData.ticketNumber || 'Unknown',
          issues: issues
        });
      }

      // Track user assignments
      if (ticketData.assignedTo) {
        if (!analysis.userMapping[ticketData.assignedTo]) {
          analysis.userMapping[ticketData.assignedTo] = 0;
        }
        analysis.userMapping[ticketData.assignedTo]++;
      }
    }

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  importTickets,
  getImportPreview
};
