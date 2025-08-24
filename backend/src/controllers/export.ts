import { Request, Response } from 'express';
import databaseService from '../services/database';
import { ApiResponse } from '../types';

export const exportData = async (req: Request, res: Response) => {
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

    const userId = req.user.userId;

    // 获取用户的所有数据
    const [recordsResult, categories, accounts] = await Promise.all([
      databaseService.getRecords(userId, 1, 10000), // 获取大量记录
      databaseService.getCategories(userId),
      databaseService.getAccounts(userId)
    ]);

    // 构建导出数据结构
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId: userId,
      data: {
        records: recordsResult.records,
        categories: categories,
        accounts: accounts,
        summary: {
          totalRecords: recordsResult.total,
          totalCategories: categories.length,
          totalAccounts: accounts.length
        }
      }
    };

    res.json({
      success: true,
      data: exportData
    } as ApiResponse);

  } catch (error: any) {
    console.error('Export data controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to export data',
        status: 500
      }
    } as ApiResponse);
  }
};