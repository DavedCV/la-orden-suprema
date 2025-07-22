import { Response } from 'express';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { BloodMarker } from '../models/BloodMarker';
import { handleError, ForbiddenError, NotFoundError } from '../utils/errors';
import { AuthRequest, ApiResponse, AdminDashboard, AssassinDashboard, Activity } from '../types';

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    // Get statistics
    const [
      totalAssassins,
      activeAssassins,
      totalMissions,
      activeMissions,
      completedMissions,
      outstandingBloodMarkers,
    ] = await Promise.all([
      User.countDocuments({ role: 'assassin' }),
      User.countDocuments({ role: 'assassin', status: 'Activo' }),
      Mission.countDocuments(),
      Mission.countDocuments({ status: { $in: ['Asignada', 'En Progreso', 'in_progress'] } }),
      Mission.countDocuments({ status: 'Completada' }),
      BloodMarker.countDocuments({ status: { $in: ['Pendiente', 'Pago Pendiente de Confirmación'] } }),
    ]);

    // Calculate total gold coins across all assassins
    const goldCoinsResult = await User.aggregate([
      { $match: { role: 'assassin' } },
      { $group: { _id: null, total: { $sum: '$goldCoins' } } },
    ]);
    const totalGoldCoins = goldCoinsResult[0]?.total || 0;

    // Get recent activity
    const recentActivity = await getRecentActivity();

    const dashboard: AdminDashboard = {
      stats: {
        totalAssassins,
        activeAssassins,
        totalMissions,
        activeMissions,
        completedMissions,
        totalGoldCoins,
        outstandingBloodMarkers,
      },
      recentActivity,
    };

    const response: ApiResponse<AdminDashboard> = {
      success: true,
      data: dashboard,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getAssassinDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    // Get full assassin profile
    const assassin = await User.findById(req.user.id);
    if (!assassin) {
      throw new NotFoundError('Assassin profile not found');
    }

    // Get active missions
    const activeMissions = await Mission.find({
      assignedTo: req.user.id,
      status: { $in: ['Asignada', 'En Progreso', 'in_progress'] },
    }).sort({ deadline: 1 });

    // Get blood marker statistics
    const [bloodMarkersOwed, bloodMarkersOwing] = await Promise.all([
      BloodMarker.countDocuments({
        requesterId: req.user.id,
        status: { $in: ['Pendiente', 'Pago Pendiente de Confirmación'] },
      }),
      BloodMarker.countDocuments({
        creditorId: req.user.id,
        status: { $in: ['Pendiente', 'Pago Pendiente de Confirmación'] },
      }),
    ]);

    // Calculate success rate
    const totalCompletedMissions = await Mission.countDocuments({
      assignedTo: req.user.id,
      status: { $in: ['Completada', 'Fallida'] },
    });
    const successfulMissions = await Mission.countDocuments({
      assignedTo: req.user.id,
      status: 'Completada',
    });
    const successRate = totalCompletedMissions > 0
      ? Math.round((successfulMissions / totalCompletedMissions) * 100)
      : 0;

    // Get recent activity for this assassin
    const recentActivity = await getAssassinRecentActivity(req.user.id);

    const dashboard: AssassinDashboard = {
      profile: (assassin as any).toJSON(),
      stats: {
        goldCoins: assassin.goldCoins || 0,
        missionsCompleted: assassin.completedMissions || 0,
        successRate,
        bloodMarkersOwed,
        bloodMarkersOwing,
      },
      activeMissions: activeMissions.map(mission => (mission as any).toJSON()),
      recentActivity,
    };

    const response: ApiResponse<AssassinDashboard> = {
      success: true,
      data: dashboard,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

// Helper function to get recent activity for admin dashboard
const getRecentActivity = async (): Promise<Activity[]> => {
  const activities: Activity[] = [];

  // Get recent completed missions
  const recentCompletedMissions = await Mission.find({
    status: 'Completada',
  })
    .populate('assignedTo', 'alias')
    .sort({ completedAt: -1 })
    .limit(5);

  recentCompletedMissions.forEach(mission => {
    if (mission.assignedTo && mission.completedAt) {
      activities.push({
        id: `mission-${mission._id}`,
        type: 'mission_completed',
        message: `${(mission.assignedTo as any).alias} completed mission "${mission.title}"`,
        timestamp: mission.completedAt,
        userId: mission.assignedTo.toString(),
      });
    }
  });

  // Get recently created assassins
  const recentAssassins = await User.find({
    role: 'assassin',
  })
    .sort({ createdAt: -1 })
    .limit(3);

  recentAssassins.forEach(assassin => {
    activities.push({
      id: `assassin-${assassin._id}`,
      type: 'assassin_joined',
      message: `New assassin "${assassin.alias}" joined the Order`,
      timestamp: assassin.createdAt!.toISOString(),
      userId: assassin._id.toString(),
    });
  });

  // Sort all activities by timestamp
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};

// Helper function to get recent activity for specific assassin
const getAssassinRecentActivity = async (assassinId: string): Promise<Activity[]> => {
  const activities: Activity[] = [];

  // Get recent missions assigned to this assassin
  const recentMissions = await Mission.find({
    assignedTo: assassinId,
  })
    .sort({ assignedAt: -1 })
    .limit(5);

  recentMissions.forEach(mission => {
    if (mission.assignedAt) {
      activities.push({
        id: `mission-assigned-${mission._id}`,
        type: 'mission_assigned',
        message: `New mission assigned: "${mission.title}"`,
        timestamp: mission.assignedAt,
        userId: assassinId,
      });
    }

    if (mission.status === 'Completada' && mission.completedAt) {
      activities.push({
        id: `mission-completed-${mission._id}`,
        type: 'mission_completed',
        message: `Mission completed: "${mission.title}" - Reward: ${mission.reward.toLocaleString()} gold coins`,
        timestamp: mission.completedAt,
        userId: assassinId,
      });
    }
  });

  // Get recent blood markers involving this assassin
  const recentBloodMarkers = await BloodMarker.find({
    $or: [
      { requesterId: assassinId },
      { creditorId: assassinId },
    ],
  })
    .populate('requesterId', 'alias')
    .populate('creditorId', 'alias')
    .sort({ createdAt: -1 })
    .limit(3);

  recentBloodMarkers.forEach(marker => {
    // Check if both requester and creditor are properly populated
    const requesterId = (marker as any).requesterId;
    const creditorId = marker.creditorId;

    if (!requesterId || !creditorId) {
      return; // Skip this marker if population failed
    }

    const isDebtor = requesterId.toString() === assassinId;
    const otherParty = isDebtor
      ? (creditorId as any).alias
      : (requesterId as any).alias;

    // Skip if we can't get the other party's name
    if (!otherParty) {
      return;
    }

    activities.push({
      id: `blood-marker-${marker._id}`,
      type: 'debt_created',
      message: isDebtor
        ? `New blood marker: Debt to ${otherParty}`
        : `New blood marker: ${otherParty} owes you a favor`,
      timestamp: marker.createdAt,
      userId: assassinId,
    });
  });

  // Sort all activities by timestamp
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};
