import { Request, Response } from 'express';
import AuthService from '../services/auth';
import { AuthRequest, ApiResponse, AuthResponse } from '../types';

const authService = new AuthService();

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          status: 400
        }
      } as ApiResponse);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long',
          status: 400
        }
      } as ApiResponse);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          status: 400
        }
      } as ApiResponse);
    }

    const result = await authService.signUp({ email, password });

    res.status(201).json({
      success: true,
      data: result
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    console.error('SignUp controller error:', error);
    
    let statusCode = 500;
    let message = 'Internal server error';

    if (error.message.includes('User already exists')) {
      statusCode = 409;
      message = 'User already exists';
    } else if (error.message.includes('Authentication error')) {
      statusCode = 400;
      message = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        status: statusCode
      }
    } as ApiResponse);
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          status: 400
        }
      } as ApiResponse);
    }

    const result = await authService.signIn({ email, password });

    res.json({
      success: true,
      data: result
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    console.error('SignIn controller error:', error);
    
    let statusCode = 401;
    let message = 'Invalid credentials';

    if (error.message.includes('Authentication failed')) {
      statusCode = 401;
      message = 'Invalid email or password';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        status: statusCode
      }
    } as ApiResponse);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token required',
          status: 401
        }
      } as ApiResponse);
    }

    const result = await authService.refreshToken(token);

    res.json({
      success: true,
      data: result
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    console.error('RefreshToken controller error:', error);
    
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          status: 401
        }
      } as ApiResponse);
    }

    const user = await authService.getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);
  } catch (error: any) {
    console.error('GetProfile controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        status: 500
      }
    } as ApiResponse);
  }
};