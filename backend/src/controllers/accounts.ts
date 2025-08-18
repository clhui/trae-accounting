import { Request, Response } from 'express';
import databaseService from '../services/database';
import { CreateAccountRequest, ApiResponse, Account } from '../types';

export const getAccounts = async (req: Request, res: Response) => {
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

    const accounts = await databaseService.getAccounts(req.user.userId);

    res.json({
      success: true,
      data: accounts
    } as ApiResponse<Account[]>);
  } catch (error: any) {
    console.error('GetAccounts controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch accounts',
        status: 500
      }
    } as ApiResponse);
  }
};

export const createAccount = async (req: Request, res: Response) => {
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

    const { name, type, balance }: CreateAccountRequest = req.body;

    // Validation
    if (!name || !type || balance === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name, type, and balance are required',
          status: 400
        }
      } as ApiResponse);
    }

    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account name cannot be empty',
          status: 400
        }
      } as ApiResponse);
    }

    if (typeof balance !== 'number' || isNaN(balance)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Balance must be a valid number',
          status: 400
        }
      } as ApiResponse);
    }

    const accountData = {
      user_id: req.user.userId,
      name: name.trim(),
      type: type.trim(),
      balance
    };

    const account = await databaseService.createAccount(accountData);

    res.status(201).json({
      success: true,
      data: account
    } as ApiResponse<Account>);
  } catch (error: any) {
    console.error('CreateAccount controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create account',
        status: 500
      }
    } as ApiResponse);
  }
};

export const updateAccount = async (req: Request, res: Response) => {
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
          message: 'Account ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    // Validate name if provided
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account name cannot be empty',
          status: 400
        }
      } as ApiResponse);
    }

    // Validate balance if provided
    if (updates.balance !== undefined && (typeof updates.balance !== 'number' || isNaN(updates.balance))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Balance must be a valid number',
          status: 400
        }
      } as ApiResponse);
    }

    // Remove protected fields from updates
    delete updates.user_id;
    delete updates.id;
    delete updates.created_at;

    // Trim string fields if provided
    if (updates.name) {
      updates.name = updates.name.trim();
    }
    if (updates.type) {
      updates.type = updates.type.trim();
    }

    const account = await databaseService.updateAccount(id, req.user.userId, updates);

    res.json({
      success: true,
      data: account
    } as ApiResponse<Account>);
  } catch (error: any) {
    console.error('UpdateAccount controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to update account';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Account not found';
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

export const deleteAccount = async (req: Request, res: Response) => {
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
          message: 'Account ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    await databaseService.deleteAccount(id, req.user.userId);

    res.json({
      success: true,
      data: { message: 'Account deleted successfully' }
    } as ApiResponse);
  } catch (error: any) {
    console.error('DeleteAccount controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to delete account';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Account not found';
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