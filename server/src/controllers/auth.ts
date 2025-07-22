import { Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { handleError, UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest, LoginForm, ApiResponse } from '../types';

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginForm = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        { alias: email } // Allow login with alias as well
      ]
    });

    if (!existingUser || !(await existingUser.comparePassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if assassin is excommunicated
    if (existingUser.role === 'assassin' && existingUser.status === 'Excommunicado') {
      throw new ForbiddenError('Access denied: Assassin has been excommunicated from the Order');
    }

    const token = generateToken((existingUser as any).toJSON());

    const response: ApiResponse<any> = {
      success: true,
      data: {
        token,
        user: (existingUser as any).toJSON(),
      },
      message: 'Login successful',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token. We can add token blacklisting if needed.

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const verifyToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If we reach this point, the authenticate middleware has already validated the token
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const response: ApiResponse<any> = {
      success: true,
      data: (req.user as any),
      message: 'Token is valid',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Generate a new token
    const token = generateToken(req.user);

    const response: ApiResponse<{ token: string }> = {
      success: true,
      data: { token },
      message: 'Token refreshed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};
