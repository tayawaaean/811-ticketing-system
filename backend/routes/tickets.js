const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');

const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateTicketCreation,
  validateTicketUpdate,
  validateTicketId,
  validateTicketRenewal,
  validateTicketQuery
} = require('../middlewares/validation');

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     description: Retrieve tickets with filtering, sorting, and pagination. Admins see all tickets, contractors see only assigned tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Closed, Expired]
 *         description: Filter by ticket status
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Search by organization name
 *       - in: query
 *         name: ticketNumber
 *         schema:
 *           type: string
 *         description: Search by ticket number
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user (Admin only)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of tickets per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, expirationDate, ticketNumber, status]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create new ticket
 *     description: Create a new ticket. Admins can assign to any user, contractors can only assign to themselves.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketRequest'
 *           example:
 *             ticketNumber: "811-2024-001"
 *             organization: "City Utilities Inc."
 *             expirationDate: "2024-12-15T23:59:59.000Z"
 *             location: "123 Main St, Springfield, IL"
 *             coordinates:
 *               latitude: 40.7128
 *               longitude: -74.0060
 *             addressData:
 *               city: "New York"
 *               state: "NY"
 *               zipCode: "10001"
 *               fullAddress: "123 Main St, New York, NY 10001, United States"
 *             notes: "Underground utility work"
 *             assignedTo: "60f1b2b5c8f9a1b2c3d4e5f6"
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(validateTicketQuery, getTickets)
  .post(validateTicketCreation, createTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve a specific ticket. Contractors can only access tickets assigned to them.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this ticket
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update ticket
 *     description: Update ticket details. Contractors can only update tickets assigned to them.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organization:
 *                 type: string
 *                 description: Organization name
 *               location:
 *                 type: string
 *                 description: Ticket location
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign (Admin only)
 *             example:
 *               organization: "Updated Organization"
 *               location: "Updated Location"
 *               notes: "Updated notes"
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this ticket
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete ticket (Admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(validateTicketId, getTicket)
  .put(validateTicketUpdate, updateTicket)
  .delete(authorize('Admin'), validateTicketId, deleteTicket);

/**
 * @swagger
 * /api/tickets/{id}/renew:
 *   put:
 *     summary: Renew ticket
 *     description: Extend ticket expiration date by specified days (default 15). Contractors can only renew tickets assigned to them.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenewRequest'
 *           example:
 *             days: 15
 *     responses:
 *       200:
 *         description: Ticket renewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to renew this ticket
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put('/:id/renew', validateTicketRenewal, renewTicket);

/**
 * @swagger
 * /api/tickets/{id}/close:
 *   put:
 *     summary: Close ticket
 *     description: Mark ticket as closed. Contractors can only close tickets assigned to them.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to close this ticket
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put('/:id/close', validateTicketId, closeTicket);

/**
 * @swagger
 * /api/tickets/stats/overview:
 *   get:
 *     summary: Get ticket statistics
 *     description: Retrieve ticket statistics overview. Admins see all statistics, contractors see only their ticket statistics.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           description: Total number of tickets
 *                         open:
 *                           type: number
 *                           description: Number of open tickets
 *                         closed:
 *                           type: number
 *                           description: Number of closed tickets
 *                         expired:
 *                           type: number
 *                           description: Number of expired tickets
 *                         expiringSoon:
 *                           type: number
 *                           description: Number of tickets expiring within 48 hours
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stats/overview', getTicketStats);

/**
 * @swagger
 * /api/tickets/generate-number:
 *   get:
 *     summary: Generate next ticket number
 *     description: Generate the next available ticket number for preview purposes
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket number generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         ticketNumber:
 *                           type: string
 *                           description: The next available ticket number
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/generate-number', generateTicketNumber);

/**
 * @swagger
 * /api/tickets/check-number/{ticketNumber}:
 *   get:
 *     summary: Check if ticket number exists
 *     description: Check if a ticket number already exists in the system
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number to check
 *     responses:
 *       200:
 *         description: Ticket number check completed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         exists:
 *                           type: boolean
 *                           description: Whether the ticket number exists
 *                         available:
 *                           type: boolean
 *                           description: Whether the ticket number is available
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/check-number/:ticketNumber', checkTicketNumber);

/**
 * @swagger
 * /api/tickets/import:
 *   post:
 *     summary: Import tickets from JSON data
 *     description: Import multiple tickets from JSON data. Detects duplicates and allows overwrite option.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tickets:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TicketRequest'
 *               overwriteExisting:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to overwrite existing tickets with the same ticket number
 *             example:
 *               tickets:
 *                 - ticketNumber: "TKT-2024-001"
 *                   organization: "Test Organization"
 *                   status: "Open"
 *                   expirationDate: "2024-12-31T23:59:59.000Z"
 *                   location: "123 Test St, Test City, TC 12345"
 *                   notes: "Test ticket"
 *               overwriteExisting: false
 *     responses:
 *       200:
 *         description: Import completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         imported:
 *                           type: array
 *                           description: Successfully imported tickets
 *                         duplicates:
 *                           type: array
 *                           description: Duplicate tickets found
 *                         errors:
 *                           type: array
 *                           description: Tickets that failed to import
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/import', authenticate, importTickets);

module.exports = router;
