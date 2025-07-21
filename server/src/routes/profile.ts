import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  updateAssassinProfile,
  resetPasswordAdmin,
  getAssassinProfile,
} from '../controllers/profile';
import { authenticate, requireAdmin, requireAuthenticated } from '../middleware/auth';
import { validate, updateProfileSchema, changePasswordSchema } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, requireAuthenticated, getProfile);

/**
 * @route   PATCH /api/profile
 * @desc    Update current user's profile
 * @access  Private (Authenticated users)
 */
router.patch('/', authenticate, requireAuthenticated, validate(updateProfileSchema), updateProfile);

/**
 * @route   PATCH /api/profile/password
 * @desc    Change current user's password
 * @access  Private (Authenticated users)
 */
router.patch('/password', authenticate, requireAuthenticated, validate(changePasswordSchema), changePassword);

/**
 * @route   GET /api/profile/assassin/:assassinId
 * @desc    Get specific assassin's profile
 * @access  Private (Admin or self)
 */
router.get('/assassin/:assassinId', authenticate, requireAuthenticated, getAssassinProfile);

/**
 * @route   PATCH /api/profile/assassin/:assassinId
 * @desc    Update specific assassin's profile
 * @access  Private (Admin or self)
 */
router.patch('/assassin/:assassinId', authenticate, requireAuthenticated, validate(updateProfileSchema), updateAssassinProfile);

/**
 * @route   POST /api/profile/assassin/:assassinId/reset-password
 * @desc    Reset assassin's password (admin only)
 * @access  Private (Admin only)
 */
router.post('/assassin/:assassinId/reset-password', authenticate, requireAdmin, resetPasswordAdmin);

export default router;
