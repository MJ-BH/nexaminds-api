"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailController_1 = require("../controllers/emailController");
const router = (0, express_1.Router)();
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
router.post('/send', emailController_1.sendEmail);
exports.default = router;
