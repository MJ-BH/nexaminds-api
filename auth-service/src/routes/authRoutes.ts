import { Router } from 'express';
import { register, login, updateUserUrl } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User Created
 *       400:
 *         description: Validation Error
 */
router.post('/register', register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Success (Returns Token)
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

// Internal route used by URL Builder Service
router.patch('/internal/update-url', updateUserUrl);

export default router;