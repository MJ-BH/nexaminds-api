import { Router } from 'express';
import { buildUrl } from '../controllers/urlController';

const router = Router();

/**
 * @swagger
 * /buildUrl:
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

export default router;