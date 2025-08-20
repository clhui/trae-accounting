import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth';
import { JwtPayload } from '../types';

const authService = new AuthService();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          status: 401
        }
      });
    }

    const decoded = authService.verifyToken(token);
    
    // For development with mock users, skip database user verification
    // TODO: Re-enable user verification when proper Supabase integration is restored
    if (decoded.userId.startsWith('mock_')) {
      console.log('Mock user detected, skipping database verification:', decoded.userId);
      // Add user info to request for mock users
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    } else {
      // Verify user still exists for real users
      const user = await authService.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not found',
            status: 401
          }
        });
      }

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = authService.verifyToken(token);

        // Support mock users without database verification
        if ((decoded as JwtPayload).userId && (decoded as JwtPayload).userId.startsWith('mock_')) {
          req.user = {
            userId: (decoded as JwtPayload).userId,
            email: (decoded as JwtPayload).email
          };
        } else {
          const user = await authService.getUserById((decoded as JwtPayload).userId);
          if (user) {
            req.user = {
              userId: (decoded as JwtPayload).userId,
              email: (decoded as JwtPayload).email
            };
          }
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.warn('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};