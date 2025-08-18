import { Request, Response } from 'express';
import databaseService from '../services/database';
import { CreateCategoryRequest, ApiResponse, Category } from '../types';

export const getCategories = async (req: Request, res: Response) => {
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

    const categories = await databaseService.getCategories(req.user.userId);

    res.json({
      success: true,
      data: categories
    } as ApiResponse<Category[]>);
  } catch (error: any) {
    console.error('GetCategories controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch categories',
        status: 500
      }
    } as ApiResponse);
  }
};

export const createCategory = async (req: Request, res: Response) => {
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

    const { name, type, icon, color }: CreateCategoryRequest = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name and type are required',
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

    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category name cannot be empty',
          status: 400
        }
      } as ApiResponse);
    }

    const categoryData = {
      user_id: req.user.userId,
      name: name.trim(),
      type,
      icon: icon || '',
      color: color || ''
    };

    const category = await databaseService.createCategory(categoryData);

    res.status(201).json({
      success: true,
      data: category
    } as ApiResponse<Category>);
  } catch (error: any) {
    console.error('CreateCategory controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create category',
        status: 500
      }
    } as ApiResponse);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
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
          message: 'Category ID is required',
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

    // Validate name if provided
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category name cannot be empty',
          status: 400
        }
      } as ApiResponse);
    }

    // Remove protected fields from updates
    delete updates.user_id;
    delete updates.id;
    delete updates.created_at;

    // Trim name if provided
    if (updates.name) {
      updates.name = updates.name.trim();
    }

    const category = await databaseService.updateCategory(id, req.user.userId, updates);

    res.json({
      success: true,
      data: category
    } as ApiResponse<Category>);
  } catch (error: any) {
    console.error('UpdateCategory controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to update category';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Category not found';
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

export const deleteCategory = async (req: Request, res: Response) => {
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
          message: 'Category ID is required',
          status: 400
        }
      } as ApiResponse);
    }

    await databaseService.deleteCategory(id, req.user.userId);

    res.json({
      success: true,
      data: { message: 'Category deleted successfully' }
    } as ApiResponse);
  } catch (error: any) {
    console.error('DeleteCategory controller error:', error);
    
    let statusCode = 500;
    let message = 'Failed to delete category';

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = 'Category not found';
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