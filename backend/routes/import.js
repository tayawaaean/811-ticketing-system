const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  importTickets,
  getImportPreview
} = require('../controllers/importController');

const { authenticate, authorize } = require('../middlewares/auth');
const { validatePaginationQuery } = require('../middlewares/validation');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('Uploaded file:', file.originalname, 'mimetype:', file.mimetype);
    // Allow JSON files and text files (some browsers send JSON as text/plain)
    if (file.mimetype === 'application/json' || file.mimetype === 'text/plain' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Only JSON files are accepted.`), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @swagger
 * tags:
 *   name: Import
 *   description: Data import operations
 */

// All import routes require admin authentication
router.use(authenticate);
router.use(authorize('Admin'));

/**
 * @swagger
 * /api/import/tickets:
 *   post:
 *     summary: Import tickets from JSON file (Admin only)
 *     description: Upload and import tickets from a JSON file. Validates data and creates tickets with proper error handling.
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: JSON file containing ticket data
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
 *                         total:
 *                           type: number
 *                           description: Total number of tickets in file
 *                         imported:
 *                           type: number
 *                           description: Number of tickets successfully imported
 *                         skipped:
 *                           type: number
 *                           description: Number of tickets skipped due to errors
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ticketNumber:
 *                                 type: string
 *                               error:
 *                                 type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: tickets.json file not found
 *       500:
 *         description: Server error
 */
// Handle multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }

  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

router.post('/tickets', upload.single('file'), handleMulterError, importTickets);

/**
 * @swagger
 * /api/import/preview:
 *   get:
 *     summary: Preview ticket import data (Admin only)
 *     description: Analyze the tickets.json file and provide a preview of what would be imported, including validation results and statistics.
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Import preview generated successfully
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
 *                         totalTickets:
 *                           type: number
 *                           description: Total number of tickets in file
 *                         validTickets:
 *                           type: number
 *                           description: Number of valid tickets
 *                         invalidTickets:
 *                           type: number
 *                           description: Number of invalid tickets
 *                         existingTickets:
 *                           type: number
 *                           description: Number of tickets that already exist
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ticketNumber:
 *                                 type: string
 *                               issues:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                         userMapping:
 *                           type: object
 *                           description: Mapping of users to ticket counts
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: tickets.json file not found
 *       500:
 *         description: Server error
 */
router.get('/preview', getImportPreview);

module.exports = router;
