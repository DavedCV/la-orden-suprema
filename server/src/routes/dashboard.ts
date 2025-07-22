import { Router } from 'express';
import { getAdminDashboard, getAssassinDashboard } from '../controllers/dashboard';
import { authenticate, requireAdmin, requireAssassin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/dashboard/admin
 * @desc    Get admin dashboard data with system statistics
 * @access  Private (Admin only)
 */
router.get('/admin', authenticate, requireAdmin, getAdminDashboard);

/**
 * @route   GET /api/dashboard/assassin
 * @desc    Get assassin dashboard data with personal statistics
 * @access  Private (Assassin only)
 */
router.get('/assassin', authenticate, requireAssassin, getAssassinDashboard);

export default router;
