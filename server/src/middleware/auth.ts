import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, JWTPayload, UserRole } from '../types';

// Use the SAME JWT_SECRET loading logic as jwt.ts
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Middleware to authenticate JWT tokens
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database to ensure user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
      });
      return;
    }

    // Check if assassin is excommunicated
    if (user.role === 'assassin' && user.status === 'Excommunicado') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You have been excommunicated from the Order.',
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired.',
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Middleware to authorize specific roles
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
      return;
    }

    next();
  };
};

// Middleware to ensure admin access
export const requireAdmin = authorize('admin');

// Middleware to ensure assassin access
export const requireAssassin = authorize('assassin');

// Middleware to allow both admin and assassin access
export const requireAuthenticated = authorize('admin', 'assassin');

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user as any;
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth, just continue without user
    next();
  }
};
