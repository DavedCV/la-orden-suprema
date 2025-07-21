import { Router } from 'express';
import {
  getAssassins,
  createAssassin,
  updateAssassinStatus,
  deleteAssassin,
  searchAssassins,
  getAssassinById,
} from '../controllers/assassins';
import { authenticate, requireAdmin, requireAuthenticated } from '../middleware/auth';
import { validate, createAssassinSchema } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/assassins
 * @desc    Get paginated list of assassins with optional filters
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, getAssassins);

/**
 * @route   POST /api/assassins
 * @desc    Create a new assassin with temporary credentials
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, validate(createAssassinSchema), createAssassin);

/**
 * @route   GET /api/assassins/search
 * @desc    Search assassins by alias, real name, or email
 * @access  Private (Authenticated users)
 */
router.get('/search', authenticate, requireAuthenticated, searchAssassins);

/**
 * @route   GET /api/assassins/:assassinId
 * @desc    Get assassin details by ID
 * @access  Private (Admin or self)
 */
router.get('/:assassinId', authenticate, requireAuthenticated, getAssassinById);

/**
 * @route   PATCH /api/assassins/:assassinId/status
 * @desc    Update assassin status (Active, Retired, Excommunicated)
 * @access  Private (Admin only)
 */
router.patch('/:assassinId/status', authenticate, requireAdmin, updateAssassinStatus);

/**
 * @route   DELETE /api/assassins/:assassinId
 * @desc    Delete assassin (actually marks as excommunicated)
 * @access  Private (Admin only)
 */
router.delete('/:assassinId', authenticate, requireAdmin, deleteAssassin);

export default router;
