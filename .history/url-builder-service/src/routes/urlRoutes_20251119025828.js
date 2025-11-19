const express = require('express');
const router = express.Router();
const { buildUrl } = require('../controllers/urlController');

/**
 * @swagger
 * /api/v1/tools/buildUrl:
 *   post:
 *     summary: Generate URL based on timestamps
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               timestamps: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: URL Generated
 */
router.post('/buildUrl', buildUrl);

module.exports = router;