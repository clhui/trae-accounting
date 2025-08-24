import { Request, Response } from 'express';
import databaseService from '../services/database';
import { ApiResponse } from '../types';

// 月度统计接口
export const getMonthlyStatistics = async (req: Request, res: Response) => {
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

    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Year and month parameters are required',
          status: 400
        }
      } as ApiResponse);
    }

    const yearNum = parseInt(year as string);
    const monthNum = parseInt(month as string);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid year or month parameter',
          status: 400
        }
      } as ApiResponse);
    }

    const statistics = await databaseService.getMonthlyStatistics(req.user.userId, yearNum, monthNum);

    res.json({
      success: true,
      data: statistics
    } as ApiResponse);
  } catch (error: any) {
    console.error('GetMonthlyStatistics controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch monthly statistics',
        status: 500
      }
    } as ApiResponse);
  }
};

// 分类统计接口
export const getCategoryStatistics = async (req: Request, res: Response) => {
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

    const { startDate, endDate, type } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'startDate and endDate parameters are required',
          status: 400
        }
      } as ApiResponse);
    }

    const recordType = type as 'income' | 'expense' || 'expense';
    
    if (recordType !== 'income' && recordType !== 'expense') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Type must be either "income" or "expense"',
          status: 400
        }
      } as ApiResponse);
    }

    const statistics = await databaseService.getCategoryStatistics(
      req.user.userId, 
      startDate as string, 
      endDate as string, 
      recordType
    );

    res.json({
      success: true,
      data: statistics
    } as ApiResponse);
  } catch (error: any) {
    console.error('GetCategoryStatistics controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch category statistics',
        status: 500
      }
    } as ApiResponse);
  }
};

// 账户统计接口
export const getAccountStatistics = async (req: Request, res: Response) => {
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

    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'startDate and endDate parameters are required',
          status: 400
        }
      } as ApiResponse);
    }

    const statistics = await databaseService.getAccountStatistics(
      req.user.userId, 
      startDate as string, 
      endDate as string
    );

    res.json({
      success: true,
      data: statistics
    } as ApiResponse);
  } catch (error: any) {
    console.error('GetAccountStatistics controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch account statistics',
        status: 500
      }
    } as ApiResponse);
  }
};