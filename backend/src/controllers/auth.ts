import { Request, Response } from 'express';
import AuthService from '../services/auth';
import { AuthRequest, ApiResponse, AuthResponse } from '../types';

const authService = new AuthService();

export const signUp = async (req: Request, res: Response) => {
  try {
    const { identifier: email, password, username }: AuthRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: '邮箱和密码不能为空',
          status: 400
        }
      } as ApiResponse);
    }

    // 验证邮箱格式
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: {
          message: '请输入有效的邮箱地址',
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

    const result = await authService.signUp({ identifier: email, password, username });

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
    const { identifier, password }: AuthRequest = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: '账户和密码不能为空',
          status: 400
        }
      } as ApiResponse);
    }

    const result = await authService.signIn({ identifier, password });

    res.json({
      success: true,
      data: result
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    console.error('SignIn controller error:', error);
    
    let statusCode = 401;
    let message = error.message || 'Invalid credentials';

    if (error.message.includes('Authentication failed')) {
      statusCode = 401;
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
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          status: 401
        }
      } as ApiResponse);
    }

    const user = await authService.getUserById(userId);
    
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
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        status: 500
      }
    } as ApiResponse);
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email }: { email: string } = req.body;

    // 验证邮箱格式
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: '邮箱不能为空',
          status: 400
        }
      } as ApiResponse);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: '请输入有效的邮箱地址',
          status: 400
        }
      } as ApiResponse);
    }

    // 请求密码重置
    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      data: {
        message: '密码重置邮件已发送，请检查您的邮箱'
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : '发送重置邮件失败',
        status: 500
      }
    } as ApiResponse);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword }: { token: string; newPassword: string } = req.body;

    // 验证输入
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: '重置令牌和新密码不能为空',
          status: 400
        }
      } as ApiResponse);
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: '密码长度至少6位',
          status: 400
        }
      } as ApiResponse);
    }

    // 重置密码
    await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      data: {
        message: '密码重置成功，请使用新密码登录'
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : '密码重置失败',
        status: 400
      }
    } as ApiResponse);
  }
};