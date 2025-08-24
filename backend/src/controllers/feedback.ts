import { Request, Response } from 'express';
import databaseService from '../services/database';
import { CreateFeedbackRequest, ApiResponse, Feedback } from '../types';

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const { limit, page } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;
    const pageNum = page ? parseInt(page as string) : 1;
    
    // 如果用户已登录，只获取该用户的反馈；否则获取所有反馈（管理员功能）
    const userId = req.user?.userId;
    
    const result = await databaseService.getFeedback(userId, pageNum, limitNum);

    res.json({
      success: true,
      data: result.feedback,
      meta: {
        total: result.total,
        limit: limitNum,
        page: pageNum
      }
    } as ApiResponse<Feedback[]>);
  } catch (error: any) {
    console.error('GetFeedback controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch feedback',
        status: 500
      }
    } as ApiResponse);
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackData: CreateFeedbackRequest = req.body;
    
    // 验证必填字段
    if (!feedbackData.type || !feedbackData.title || !feedbackData.description) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Type, title, and description are required',
          status: 400
        }
      } as ApiResponse);
    }
    
    // 验证反馈类型
    const validTypes = ['bug_report', 'feature_request', 'improvement', 'other'];
    if (!validTypes.includes(feedbackData.type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid feedback type',
          status: 400
        }
      } as ApiResponse);
    }
    
    // 创建反馈数据
    const newFeedback = {
      ...feedbackData,
      user_id: req.user?.userId // 如果用户未登录，user_id 为 undefined
    };
    
    const feedback = await databaseService.createFeedback(newFeedback);
    
    res.status(201).json({
      success: true,
      data: feedback
    } as ApiResponse<Feedback>);
  } catch (error: any) {
    console.error('CreateFeedback controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create feedback',
        status: 500
      }
    } as ApiResponse);
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status value',
          status: 400
        }
      } as ApiResponse);
    }
    
    const feedback = await databaseService.updateFeedbackStatus(id, status);
    
    res.json({
      success: true,
      data: feedback
    } as ApiResponse<Feedback>);
  } catch (error: any) {
    console.error('UpdateFeedbackStatus controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to update feedback status',
        status: 500
      }
    } as ApiResponse);
  }
};