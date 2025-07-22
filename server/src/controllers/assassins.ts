import { Response } from 'express';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { generateTemporaryPassword } from '../utils/jwt';
import { handleError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import { AuthRequest, ApiResponse, PaginatedResponse, CreateAssassinForm, AsassinStatus } from '../types';

export const getAssassins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Different behavior for admins vs assassins
    if (req.user.role === 'admin') {
      // Full admin access with pagination and filtering
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build query filters
      const filter: any = { role: 'assassin' };

      if (req.query.status && req.query.status !== 'Todos') {
        filter.status = req.query.status;
      }

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        filter.$or = [
          { alias: searchRegex },
          { realName: searchRegex },
          { email: searchRegex },
        ];
      }

      const [assassins, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      const response: PaginatedResponse<any> = {
        success: true,
        data: assassins.map(assassin => assassin.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      res.status(200).json(response);
    } else if (req.user.role === 'assassin') {
      // Limited access for assassins - only basic info about active assassins
      const assassins = await User.find({
        role: 'assassin',
        status: 'Activo', // Only active assassins
      })
        .select('id alias realName status joinDate completedMissions goldCoins') // Limited fields
        .sort({ alias: 1 });

      const response: ApiResponse<any[]> = {
        success: true,
        data: assassins.map(assassin => assassin.toJSON()),
      };

      res.status(200).json(response);
    } else {
      throw new ForbiddenError('Invalid user role');
    }
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const createAssassin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const assassinData: CreateAssassinForm = req.body;

    // Check if email or alias already exists
    const existingUser = await User.findOne({
      $or: [
        { email: assassinData.email },
        { alias: assassinData.alias },
      ],
    });

    if (existingUser) {
      if (existingUser.email === assassinData.email) {
        throw new ConflictError('Email already exists');
      }
      if (existingUser.alias === assassinData.alias) {
        throw new ConflictError('Alias already exists');
      }
    }

    // Generate temporary password if not provided
    const temporaryPassword = assassinData.temporaryPassword || generateTemporaryPassword();

    // Create new assassin
    const newAssassin = new User({
      alias: assassinData.alias,
      email: assassinData.email,
      password: temporaryPassword,
      role: 'assassin',
      realName: assassinData.realName,
      skills: assassinData.skills,
      goldCoins: assassinData.initialGoldCoins || 1000,
      status: assassinData.initialStatus || 'Activo',
      isFirstLogin: true,
      temporaryPassword: true,
    });

    await newAssassin.save();

    // In a real application, you would send an email with temporary credentials
    console.log(`Temporary credentials for ${assassinData.alias}:`);
    console.log(`Email: ${assassinData.email}`);
    console.log(`Password: ${temporaryPassword}`);

    const response: ApiResponse<any> = {
      success: true,
      data: newAssassin.toJSON(),
      message: 'Assassin created successfully with temporary credentials',
    };

    res.status(201).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const updateAssassinStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { assassinId } = req.params;
    const { status }: { status: AsassinStatus } = req.body;

    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' });
    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    const oldStatus = assassin.status;
    assassin.status = status;
    await assassin.save();

    // If assassin is being excommunicated, unassign all their missions
    if (status === 'Excommunicado' && oldStatus !== 'Excommunicado') {
      await Mission.updateMany(
        {
          assignedTo: assassinId,
          status: { $in: ['Asignada', 'En Progreso', 'in_progress'] },
        },
        {
          $unset: { assignedTo: '', assignedAt: '' },
          $set: { status: 'No Asignada' },
        }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: assassin.toJSON(),
      message: `Assassin status updated to ${status}`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const deleteAssassin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { assassinId } = req.params;

    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' });
    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Check if assassin has active missions
    const activeMissions = await Mission.countDocuments({
      assignedTo: assassinId,
      status: { $in: ['Asignada', 'En Progreso', 'in_progress'] },
    });

    if (activeMissions > 0) {
      throw new ConflictError('Cannot delete assassin with active missions. Please reassign or complete missions first.');
    }

    // Mark assassin as excommunicated instead of deleting (for data integrity)
    assassin.status = 'Excommunicado';
    await assassin.save();

    const response: ApiResponse = {
      success: true,
      message: 'Assassin has been excommunicated',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const searchAssassins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const query = req.query.q as string;
    if (!query || query.length < 2) {
      const response: ApiResponse<any[]> = {
        success: true,
        data: [],
        message: 'Search query must be at least 2 characters',
      };
      res.status(200).json(response);
      return;
    }

    const searchRegex = new RegExp(query, 'i');
    const assassins = await User.find({
      role: 'assassin',
      status: { $ne: 'Excommunicado' }, // Exclude excommunicated assassins
      $or: [
        { alias: searchRegex },
        { realName: searchRegex },
        { email: searchRegex },
      ],
    })
      .select('-password')
      .limit(20)
      .sort({ alias: 1 });

    const response: ApiResponse<any[]> = {
      success: true,
      data: assassins.map(assassin => assassin.toJSON()),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getAssassinById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { assassinId } = req.params;

    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' })
      .select('-password');

    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Only allow admins or the assassin themselves to view full details
    if (req.user.role !== 'admin' && req.user.id !== assassinId) {
      // Return limited public information for other assassins
      const publicInfo = {
        id: assassin.id,
        alias: assassin.alias,
        status: assassin.status,
        joinDate: assassin.joinDate,
        completedMissions: assassin.completedMissions,
      };

      const response: ApiResponse<any> = {
        success: true,
        data: publicInfo,
      };

      res.status(200).json(response);
      return;
    }

    const response: ApiResponse<any> = {
      success: true,
      data: assassin.toJSON(),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};
