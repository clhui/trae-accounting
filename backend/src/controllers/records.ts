import { Request, Response } from 'express';
import databaseService from '../services/database';
import { CreateRecordRequest, UpdateRecordRequest, ApiResponse, Record } from '../types';

export const getRecords = async (req: Request, res: Response) => {
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

    const { limit, page } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;
    const pageNum = page ? parseInt(page as string) : 1;

    const result = await databaseService.getRecords(req.user.userId, pageNum, limitNum);

    res.json({
      success: true,
      data: result.records,
      meta: {
        total: result.total,
        limit: limitNum,
        page: pageNum
      }
    } as ApiResponse<Record[]>);
  } catch (error: any) {
    console.error('GetRecords controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch records',
        status: 500
      }
    } as ApiResponse);
  }
};

export const getRecord = async (req: Request, res: Response) => {
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

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Record ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    const record = await databaseService.getRecordById(id, req.user.userId);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Record not found',
          status: 404
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: record
    } as ApiResponse<Record>);
  } catch (error: any) {
    console.error('GetRecord controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch record',
        status: 500
      }
    } as ApiResponse);
  }
};

export const createRecord = async (req: Request, res: Response) => {
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

    const { amount, type, category_id, account_id, description, date }: CreateRecordRequest = req.body;

    // Validation
    if (!amount || !type || !category_id || !account_id || !date) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Amount, type, category_id, account_id, and date are required',
          status: 400
        }
      } as ApiResponse);
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Type must be either "income" or "expense"',
          status: 400
        }
      } as ApiResponse);
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Amount must be greater than 0',
          status: 400
        }
      } as ApiResponse);
    }

    const recordData = {
      user_id: req.user.userId,
      amount,
      type,
      category_id,
      account_id,
      description: description || '',
      date
    };

    const record = await databaseService.createRecord(recordData);

    res.status(201).json({
      success: true,
      data: record
    } as ApiResponse<Record>);
  } catch (error: any) {
    console.error('CreateRecord controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create record',
        status: 500
      }
    } as ApiResponse);
  }
};

export const updateRecord = async (req: Request, res: Response) => {
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

    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Record ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    // Validate type if provided
    if (updates.type && updates.type !== 'income' && updates.type !== 'expense') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Type must be either "income" or "expense"',
          status: 400
        }
      } as ApiResponse);
    }

    // Validate amount if provided
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Amount must be greater than 0',
          status: 400
        }
      } as ApiResponse);
    }

    // Remove user_id from updates to prevent modification
    delete updates.user_id;
    delete updates.id;
    delete updates.created_at;

    const record = await databaseService.updateRecord(id, req.user.userId, updates);

    res.json({
      success: true,
      data: record
    } as ApiResponse<Record>);
  } catch (error: any) {
    console.error('UpdateRecord controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to update record';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Record not found';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || message,
        status: statusCode
      }
    } as ApiResponse);
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
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

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Record ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    await databaseService.deleteRecord(id, req.user.userId);

    res.json({
      success: true,
      data: { message: 'Record deleted successfully' }
    } as ApiResponse);
  } catch (error: any) {
    console.error('DeleteRecord controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to delete record';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Record not found';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || message,
        status: statusCode
      }
    } as ApiResponse);
  }
};