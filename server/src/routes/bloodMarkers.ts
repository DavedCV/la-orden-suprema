import { Router } from 'express';
import {
  getBloodMarkers,
  createBloodMarker,
  respondToBloodMarkerRequest,
  payBloodMarker,
  confirmBloodMarkerPayment,
  getBloodMarkersByUser,
  deleteBloodMarker,
} from '../controllers/bloodMarkers';
import { authenticate, requireAdmin, requireAssassin, requireAuthenticated } from '../middleware/auth';
import { validate, createBloodMarkerSchema, respondToBloodMarkerSchema } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/blood-markers
 * @desc    Get blood markers (all for admin, own for assassins)
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, requireAuthenticated, getBloodMarkers);

/**
 * @route   POST /api/blood-markers
 * @desc    Create a new blood marker request
 * @access  Private (Assassin only)
 */
router.post('/', authenticate, requireAssassin, validate(createBloodMarkerSchema), createBloodMarker);

/**
 * @route   GET /api/blood-markers/user/:userId
 * @desc    Get blood markers for a specific user
 * @access  Private (Admin or self)
 */
router.get('/user/:userId', authenticate, requireAuthenticated, getBloodMarkersByUser);

/**
 * @route   PATCH /api/blood-markers/:markerId/respond
 * @desc    Respond to a blood marker request (accept/reject)
 * @access  Private (Assassin only - creditor)
 */
router.patch('/:markerId/respond', authenticate, requireAssassin, validate(respondToBloodMarkerSchema), respondToBloodMarkerRequest);

/**
 * @route   PATCH /api/blood-markers/:markerId/pay
 * @desc    Mark blood marker as paid
 * @access  Private (Assassin only - debtor)
 */
router.patch('/:markerId/pay', authenticate, requireAssassin, payBloodMarker);

/**
 * @route   PATCH /api/blood-markers/:markerId/confirm
 * @desc    Confirm blood marker payment
 * @access  Private (Assassin only - creditor)
 */
router.patch('/:markerId/confirm', authenticate, requireAssassin, confirmBloodMarkerPayment);

/**
 * @route   DELETE /api/blood-markers/:markerId
 * @desc    Delete blood marker (admin only, settled/rejected only)
 * @access  Private (Admin only)
 */
router.delete('/:markerId', authenticate, requireAdmin, deleteBloodMarker);

export default router;
