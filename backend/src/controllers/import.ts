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
      recordsSkipped: 0,
      categoriesSkipped: 0,
      accountsSkipped: 0,
      errors: [] as string[]
    };

    // ID映射表，用于重新关联主外键
    const categoryIdMap = new Map<string, string>(); // 原ID -> 新ID
    const accountIdMap = new Map<string, string>(); // 原ID -> 新ID

    // 获取现有数据，减少重复查询
    const [existingCategories, existingAccounts] = await Promise.all([
      databaseService.getCategories(userId),
      databaseService.getAccounts(userId)
    ]);

    // 导入分类数据
    if (categories && Array.isArray(categories)) {
      for (const category of categories) {
        try {
          // 检查分类是否已存在（按名称和类型去重）
          const exists = existingCategories.find(c => c.name === category.name && c.type === category.type);
          
          if (exists) {
            // 已存在，建立ID映射关系
            if (category.id) {
              categoryIdMap.set(category.id, exists.id);
            }
            importStats.categoriesSkipped++;
          } else {
            // 不存在，创建新分类
            const newCategory = await databaseService.createCategory({
              user_id: userId,
              name: category.name,
              type: category.type,
              icon: category.icon || '📝',
              color: category.color || '#1976d2'
            });
            
            // 建立ID映射关系
            if (category.id && newCategory.id) {
              categoryIdMap.set(category.id, newCategory.id);
            }
            
            // 更新现有分类列表
            existingCategories.push(newCategory);
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
          // 检查账户是否已存在（按名称去重）
          const exists = existingAccounts.find(a => a.name === account.name);
          
          if (exists) {
            // 已存在，建立ID映射关系
            if (account.id) {
              accountIdMap.set(account.id, exists.id);
            }
            importStats.accountsSkipped++;
          } else {
            // 不存在，创建新账户
            const newAccount = await databaseService.createAccount({
              user_id: userId,
              name: account.name,
              type: account.type,
              balance: account.balance || 0
            });
            
            // 建立ID映射关系
            if (account.id && newAccount.id) {
              accountIdMap.set(account.id, newAccount.id);
            }
            
            // 更新现有账户列表
            existingAccounts.push(newAccount);
            importStats.accountsImported++;
          }
        } catch (error: any) {
          importStats.errors.push(`Failed to import account ${account.name}: ${error.message}`);
        }
      }
    }

    // 导入记录数据
    if (records && Array.isArray(records)) {
      // 获取现有记录用于去重检查
      const existingRecords = await databaseService.getRecords(userId, 1, 10000);
      
      for (const record of records) {
        try {
          let categoryId: string;
          let accountId: string;

          // 使用ID映射表重新关联分类ID
          if (record.category_id) {
            // 优先使用ID映射表
            const mappedCategoryId = categoryIdMap.get(record.category_id);
            if (mappedCategoryId) {
              categoryId = mappedCategoryId;
            } else {
              // 直接验证ID是否存在
              const category = existingCategories.find(c => c.id === record.category_id);
              if (category) {
                categoryId = record.category_id;
              } else {
                // ID不存在，尝试通过类型查找默认分类
                const categoryByType = existingCategories.find(c => c.type === record.type);
                if (categoryByType) {
                  categoryId = categoryByType.id;
                  importStats.errors.push(`Category ID ${record.category_id} not found, used default category: ${categoryByType.name}`);
                } else {
                  importStats.errors.push(`Category ID ${record.category_id} not found for record: ${record.description || 'Unknown'}`);
                  continue;
                }
              }
            }
          } else if (record.category && record.category.name) {
            // 旧格式：通过名称查找ID
            const category = existingCategories.find(c => c.name === record.category.name && c.type === record.type);
            if (!category) {
              importStats.errors.push(`Category not found for record: ${record.category.name}`);
              continue;
            }
            categoryId = category.id;
          } else {
            importStats.errors.push(`Invalid category data for record: ${record.description || 'Unknown'}`);
            continue;
          }

          // 使用ID映射表重新关联账户ID
          if (record.account_id) {
            // 优先使用ID映射表
            const mappedAccountId = accountIdMap.get(record.account_id);
            if (mappedAccountId) {
              accountId = mappedAccountId;
            } else {
              // 直接验证ID是否存在
              const account = existingAccounts.find(a => a.id === record.account_id);
              if (account) {
                accountId = record.account_id;
              } else {
                // ID不存在，使用第一个可用账户
                const defaultAccount = existingAccounts[0];
                if (defaultAccount) {
                  accountId = defaultAccount.id;
                  importStats.errors.push(`Account ID ${record.account_id} not found, used default account: ${defaultAccount.name}`);
                } else {
                  importStats.errors.push(`Account ID ${record.account_id} not found for record: ${record.description || 'Unknown'}`);
                  continue;
                }
              }
            }
          } else if (record.account && record.account.name) {
            // 旧格式：通过名称查找ID
            const account = existingAccounts.find(a => a.name === record.account.name);
            if (!account) {
              importStats.errors.push(`Account not found for record: ${record.account.name}`);
              continue;
            }
            accountId = account.id;
          } else {
            importStats.errors.push(`Invalid account data for record: ${record.description || 'Unknown'}`);
            continue;
          }

          // 记录去重检查（基于金额、描述、日期、分类和账户）
          const isDuplicate = existingRecords.records.some(existing => 
            existing.amount === record.amount &&
            existing.description === (record.description || '') &&
            existing.date === record.date &&
            existing.category_id === categoryId &&
            existing.account_id === accountId
          );

          if (isDuplicate) {
            importStats.recordsSkipped++;
            continue;
          }

          const newRecord = await databaseService.createRecord({
            user_id: userId,
            type: record.type,
            amount: record.amount,
            category_id: categoryId,
            account_id: accountId,
            description: record.description || '',
            date: record.date
          });
          
          // 添加到现有记录列表中，用于后续去重检查
          existingRecords.records.push(newRecord);
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
        stats: {
          categoriesImported: importStats.categoriesImported,
          categoriesSkipped: importStats.categoriesSkipped,
          accountsImported: importStats.accountsImported,
          accountsSkipped: importStats.accountsSkipped,
          recordsImported: importStats.recordsImported,
          recordsSkipped: importStats.recordsSkipped,
          errors: importStats.errors
        }
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