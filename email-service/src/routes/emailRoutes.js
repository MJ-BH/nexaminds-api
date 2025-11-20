const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

/**
 * @swagger
 * /send:
 *   post:
 *     summary: Send an email (via Queue)
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               url: { type: string }
 *     responses:
 *       202:
 *         description: Request Accepted
 */
router.post('/send', emailController.sendEmail);

module.exports = router;