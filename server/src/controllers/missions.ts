import { Response } from 'express';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { handleError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { AuthRequest, ApiResponse, PaginatedResponse, CreateMissionForm, MissionStatus } from '../types';

export const getMissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query filters
    const filter: any = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      filter.priority = req.query.priority;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { targetName: searchRegex },
      ];
    }

    const [missions, total] = await Promise.all([
      Mission.find(filter)
        .populate('assignedTo', 'alias email')
        .populate('createdBy', 'alias email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Mission.countDocuments(filter),
    ]);

    const response: PaginatedResponse<any> = {
      success: true,
      data: missions.map(mission => mission.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getAvailableMissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    // Get missions that are unassigned and not expired
    const availableMissions = await Mission.find({
      status: 'No Asignada',
      deadline: { $gt: new Date() },
    })
      .populate('createdBy', 'alias')
      .sort({ priority: -1, deadline: 1 });

    const response: ApiResponse<any[]> = {
      success: true,
      data: availableMissions.map(mission => mission.toJSON()),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getAssassinMissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    // Get all missions assigned to this assassin
    const assassinMissions = await Mission.find({
      assignedTo: req.user.id,
    })
      .populate('createdBy', 'alias')
      .sort({ deadline: 1 });

    const response: ApiResponse<any[]> = {
      success: true,
      data: assassinMissions.map(mission => mission.toJSON()),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const createMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const missionData: CreateMissionForm = req.body;

    // Validate deadline is in the future
    const deadline = new Date(missionData.deadline);
    if (deadline <= new Date()) {
      throw new ValidationError('Mission deadline must be in the future');
    }

    const newMission = new Mission({
      ...missionData,
      deadline,
      createdBy: req.user.id,
      status: 'No Asignada',
    });

    await newMission.save();
    await newMission.populate('createdBy', 'alias email');

    const response: ApiResponse<any> = {
      success: true,
      data: newMission.toJSON(),
      message: 'Mission created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const updateMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { missionId } = req.params;
    const updateData = req.body;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    // Validate deadline if being updated
    if (updateData.deadline) {
      const deadline = new Date(updateData.deadline);
      if (deadline <= new Date()) {
        throw new ValidationError('Mission deadline must be in the future');
      }
    }

    // Don't allow updating assigned missions unless changing status
    if (mission.assignedTo && updateData.status !== undefined && updateData.status !== mission.status) {
      // Only allow certain status transitions
      const allowedTransitions = ['Asignada', 'En Progreso', 'Completada', 'Fallida'];
      if (!allowedTransitions.includes(updateData.status)) {
        throw new ValidationError('Invalid status transition for assigned mission');
      }
    }

    Object.assign(mission, updateData);
    await mission.save();
    await mission.populate([
      { path: 'assignedTo', select: 'alias email' },
      { path: 'createdBy', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: mission.toJSON(),
      message: 'Mission updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const assignMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { missionId } = req.params;
    const { assassinId } = req.body;

    const [mission, assassin] = await Promise.all([
      Mission.findById(missionId),
      User.findOne({ _id: assassinId, role: 'assassin' }),
    ]);

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Check if mission is available for assignment
    if (mission.status !== 'No Asignada') {
      throw new ConflictError('Mission is not available for assignment');
    }

    // Check if assassin is active
    if (assassin.status !== 'Activo') {
      throw new ConflictError('Can only assign missions to active assassins');
    }

    // Check if deadline has passed
    if (new Date(mission.deadline) <= new Date()) {
      throw new ConflictError('Cannot assign expired mission');
    }

    // Assign mission
    mission.assignedTo = assassinId;
    mission.status = 'Asignada';
    (mission as any).assignedAt = new Date().toISOString();

    await mission.save();
    await mission.populate([
      { path: 'assignedTo', select: 'alias email' },
      { path: 'createdBy', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: mission.toJSON(),
      message: `Mission assigned to ${assassin.alias}`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const applyToMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'assassin') {
      throw new ForbiddenError('Assassin access required');
    }

    const { missionId } = req.params;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    // Check if mission is available
    if (mission.status !== 'No Asignada') {
      throw new ConflictError('Mission is not available');
    }

    // Check if deadline has passed
    if (new Date(mission.deadline) <= new Date()) {
      throw new ConflictError('Cannot take expired mission');
    }

    // Check if assassin is active
    const assassin = await User.findById(req.user.id);
    if (!assassin || assassin.status !== 'Activo') {
      throw new ConflictError('Only active assassins can take missions');
    }

    // Directly assign the mission to the assassin
    mission.assignedTo = req.user.id;
    mission.status = 'Asignada';
    (mission as any).assignedAt = new Date().toISOString();

    await mission.save();
    await mission.populate([
      { path: 'assignedTo', select: 'alias email' },
      { path: 'createdBy', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: mission.toJSON(),
      message: `Mission assigned successfully to ${assassin.alias}`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const updateMissionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { missionId } = req.params;
    const { status }: { status: MissionStatus } = req.body;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    // Authorization check
    if (req.user?.role === 'admin') {
      // Admins can change any status
    } else if (req.user?.role === 'assassin' && mission.assignedTo?.toString() === req.user.id) {
      // Assassins can only update their own missions to specific statuses
      const allowedStatuses: MissionStatus[] = ['En Progreso', 'in_progress', 'Completada'];
      if (!allowedStatuses.includes(status)) {
        throw new ForbiddenError('Assassins can only mark missions as in progress or completed');
      }
    } else {
      throw new ForbiddenError('Access denied');
    }

    const oldStatus = mission.status;
    mission.status = status;

    // Handle status-specific logic
    if (status === 'Completada' && oldStatus !== 'Completada') {
      (mission as any).completedAt = new Date().toISOString();

      // Award gold coins to assassin
      if (mission.assignedTo) {
        await User.findByIdAndUpdate(mission.assignedTo, {
          $inc: {
            goldCoins: mission.reward,
            completedMissions: 1
          }
        });
      }
    }

    await mission.save();
    await mission.populate([
      { path: 'assignedTo', select: 'alias email' },
      { path: 'createdBy', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: mission.toJSON(),
      message: `Mission status updated to ${status}`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const deleteMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { missionId } = req.params;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    // Don't allow deletion of assigned missions
    if (mission.assignedTo && !['Completada', 'Fallida'].includes(mission.status)) {
      throw new ConflictError('Cannot delete mission that is assigned and not completed or failed');
    }

    await Mission.findByIdAndDelete(missionId);

    const response: ApiResponse = {
      success: true,
      message: 'Mission deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};
