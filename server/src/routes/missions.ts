import { Router } from 'express';
import {
  getMissions,
  getAvailableMissions,
  getAssassinMissions,
  createMission,
  updateMission,
  assignMission,
  applyToMission,
  updateMissionStatus,
  deleteMission,
} from '../controllers/missions';
import { authenticate, requireAdmin, requireAssassin, requireAuthenticated } from '../middleware/auth';
import { validate, createMissionSchema, updateMissionSchema } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/missions
 * @desc    Get paginated list of missions with optional filters
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, getMissions);

/**
 * @route   GET /api/missions/available
 * @desc    Get available missions for assassins to apply to
 * @access  Private (Assassin only)
 */
router.get('/available', authenticate, requireAssassin, getAvailableMissions);

/**
 * @route   GET /api/missions/my-missions
 * @desc    Get missions assigned to the current assassin
 * @access  Private (Assassin only)
 */
router.get('/my-missions', authenticate, requireAssassin, getAssassinMissions);

/**
 * @route   POST /api/missions
 * @desc    Create a new mission
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, validate(createMissionSchema), createMission);

/**
 * @route   PUT /api/missions/:missionId
 * @desc    Update mission details
 * @access  Private (Admin only)
 */
router.put('/:missionId', authenticate, requireAdmin, validate(updateMissionSchema), updateMission);

/**
 * @route   PATCH /api/missions/:missionId/assign
 * @desc    Assign mission to an assassin
 * @access  Private (Admin only)
 */
router.patch('/:missionId/assign', authenticate, requireAdmin, assignMission);

/**
 * @route   POST /api/missions/:missionId/apply
 * @desc    Take an available mission (directly assign to assassin)
 * @access  Private (Assassin only)
 */
router.post('/:missionId/apply', authenticate, requireAssassin, applyToMission);

/**
 * @route   PATCH /api/missions/:missionId/status
 * @desc    Update mission status
 * @access  Private (Admin or assigned assassin)
 */
router.patch('/:missionId/status', authenticate, requireAuthenticated, updateMissionStatus);

/**
 * @route   DELETE /api/missions/:missionId
 * @desc    Delete mission
 * @access  Private (Admin only)
 */
router.delete('/:missionId', authenticate, requireAdmin, deleteMission);

export default router;
