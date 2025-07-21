import { Response } from 'express';
import { User } from '../models/User';
import { handleError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { AuthRequest, ApiResponse } from '../types';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Get fresh user data from database
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const response: ApiResponse<any> = {
      success: true,
      data: user.toJSON(),
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const updateData = req.body;
    const userId = req.user.id;

    // Remove fields that shouldn't be updated via this endpoint
    const restrictedFields = ['password', 'email', 'role', 'goldCoins', 'completedMissions', 'status'];
    restrictedFields.forEach(field => delete updateData[field]);

    // Special handling for admins - they can't update assassin-specific fields
    if (req.user.role === 'admin') {
      const assassinFields = ['realName', 'skills', 'lastKnownLocation'];
      assassinFields.forEach(field => delete updateData[field]);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    const response: ApiResponse<any> = {
      success: true,
      data: updatedUser.toJSON(),
      message: 'Profile updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password for verification
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.temporaryPassword = false; // Mark as no longer temporary
    user.isFirstLogin = false; // Mark as no longer first login

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const updateAssassinProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { assassinId } = req.params;
    const updateData = req.body;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== assassinId) {
      throw new ForbiddenError('You can only update your own profile');
    }

    // Find the assassin
    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' });
    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Remove fields that shouldn't be updated
    const restrictedFields = ['password', 'email', 'role'];
    restrictedFields.forEach(field => delete updateData[field]);

    // Only admins can update certain fields
    if (req.user.role !== 'admin') {
      const adminOnlyFields = ['goldCoins', 'completedMissions', 'status'];
      adminOnlyFields.forEach(field => delete updateData[field]);
    }

    const updatedAssassin = await User.findByIdAndUpdate(
      assassinId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    const response: ApiResponse<any> = {
      success: true,
      data: updatedAssassin!.toJSON(),
      message: 'Assassin profile updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const resetPasswordAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { assassinId } = req.params;
    const { newPassword } = req.body;

    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' });
    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Reset password
    assassin.password = newPassword;
    assassin.temporaryPassword = true;
    assassin.isFirstLogin = true;

    await assassin.save();

    // In a real application, you would send the new password to the assassin
    console.log(`Password reset for ${assassin.alias}: ${newPassword}`);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully. New temporary credentials have been generated.',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const getAssassinProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { assassinId } = req.params;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== assassinId) {
      throw new ForbiddenError('Access denied');
    }

    const assassin = await User.findOne({ _id: assassinId, role: 'assassin' })
      .select('-password');

    if (!assassin) {
      throw new NotFoundError('Assassin not found');
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
