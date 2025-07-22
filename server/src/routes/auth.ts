import { Router } from 'express';
import { login, logout, verifyToken, refreshToken } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate, loginSchema } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate JWT token and return user data
 * @access  Private
 */
router.get('/validate', authenticate, verifyToken);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, refreshToken);

export default router;
