import { Request, Response } from 'express';
import databaseService from '../services/database';
import { ApiResponse } from '../types';
import multer from 'multer';

// 配置multer用于文件上传
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

export const importData = async (req: Request, res: Response) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          status: 400
        }
      } as ApiResponse);
    }

    const userId = req.user.userId;
    
    // 解析上传的JSON文件
    let importData;
    try {
      const fileContent = req.file.buffer.toString('utf8');
      importData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid JSON file format',
          status: 400
        }
      } as ApiResponse);
    }

    // 验证数据格式
    if (!importData.version || !importData.data) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid data format. Missing version or data field.',
          status: 400
        }
      } as ApiResponse);
    }

    const { records, categories, accounts } = importData.data;
    
    // 统计导入结果
    let importStats = {
      recordsImported: 0,
      categoriesImported: 0,
      accountsImported: 0,
      errors: [] as string[]
    };

    // 导入分类数据
    if (categories && Array.isArray(categories)) {
      for (const category of categories) {
        try {
          // 检查分类是否已存在
          const existingCategories = await databaseService.getCategories(userId);
          const exists = existingCategories.find(c => c.name === category.name && c.type === category.type);
          
          if (!exists) {
            await databaseService.createCategory({
              user_id: userId,
              name: category.name,
              type: category.type,
              icon: category.icon || '📝',
              color: category.color || '#1976d2'
            });
            importStats.categoriesImported++;
          }
        } catch (error: any) {
          importStats.errors.push(`Failed to import category ${category.name}: ${error.message}`);
        }
      }
    }

    // 导入账户数据
    if (accounts && Array.isArray(accounts)) {
      for (const account of accounts) {
        try {
          // 检查账户是否已存在
          const existingAccounts = await databaseService.getAccounts(userId);
          const exists = existingAccounts.find(a => a.name === account.name);
          
          if (!exists) {
            await databaseService.createAccount({
              user_id: userId,
              name: account.name,
              type: account.type,
              balance: account.balance || 0
            });
            importStats.accountsImported++;
          }
        } catch (error: any) {
          importStats.errors.push(`Failed to import account ${account.name}: ${error.message}`);
        }
      }
    }

    // 导入记录数据
    if (records && Array.isArray(records)) {
      for (const record of records) {
        try {
          // 获取最新的分类和账户列表（包含刚导入的）
          const [updatedCategories, updatedAccounts] = await Promise.all([
            databaseService.getCategories(userId),
            databaseService.getAccounts(userId)
          ]);

          // 查找对应的分类和账户ID
          const category = updatedCategories.find(c => c.name === record.category?.name && c.type === record.type);
          const account = updatedAccounts.find(a => a.name === record.account?.name);

          if (!category) {
            importStats.errors.push(`Category not found for record: ${record.category?.name}`);
            continue;
          }

          if (!account) {
            importStats.errors.push(`Account not found for record: ${record.account?.name}`);
            continue;
          }

          await databaseService.createRecord({
            user_id: userId,
            type: record.type,
            amount: record.amount,
            category_id: category.id,
            account_id: account.id,
            description: record.description || '',
            date: record.date
          });
          importStats.recordsImported++;
        } catch (error: any) {
          importStats.errors.push(`Failed to import record: ${error.message}`);
        }
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Data imported successfully',
        stats: importStats
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('Import data controller error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to import data',
        status: 500
      }
    } as ApiResponse);
  }
};