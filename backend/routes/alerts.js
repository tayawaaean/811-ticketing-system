const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  markAllAsRead,
  getAlertsStats
} = require('../controllers/alertController');

// Import middleware
const { authenticate, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 50
 *         description: Number of alerts per page
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of alerts returned
 *                 total:
 *                   type: integer
 *                   description: Total number of alerts
 *                 page:
 *                   type: integer
 *                   description: Current page
 *                 pages:
 *                   type: integer
 *                   description: Total number of pages
 *                 alerts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/', getAlerts);

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     summary: Get alerts statistics
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total alerts
 *                     unread:
 *                       type: integer
 *                       description: Unread alerts
 *                     critical:
 *                       type: integer
 *                       description: Critical severity alerts
 *                     high:
 *                       type: integer
 *                       description: High severity alerts
 *                     medium:
 *                       type: integer
 *                       description: Medium severity alerts
 *                     low:
 *                       type: integer
 *                       description: Low severity alerts
 */
router.get('/stats', getAlertsStats);

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get single alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 alert:
 *                   $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Alert not found
 */
router.get('/:id', getAlert);

/**
 * @swagger
 * /api/alerts/mark-all-read:
 *   put:
 *     summary: Mark all alerts as read
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All alerts marked as read successfully
 */
router.put('/mark-all-read', markAllAsRead);

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update alert (mark as read/unread)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 description: Mark alert as read or unread
 *                 example: true
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 */
router.put('/:id', updateAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 */
// Admin-only routes
router.delete('/:id', authorize('Admin'), deleteAlert);

module.exports = router;
