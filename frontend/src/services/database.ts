import Dexie, { Table } from 'dexie'
import { Record, Category, Account, Budget, User } from '../types'
import { v4 as uuidv4 } from 'uuid'

// 数据库类
class AccountingDatabase extends Dexie {
  users!: Table<User>
  records!: Table<Record & { userId: string }>
  categories!: Table<Category & { userId: string }>
  accounts!: Table<Account & { userId: string }>
  budgets!: Table<Budget & { userId: string }>

  constructor() {
    super('AccountingDatabase')
    
    this.version(2).stores({
      users: 'id, username, email',
      records: 'id, userId, type, amount, category, account, date, createdAt',
      categories: 'id, userId, name, type, isDefault',
      accounts: 'id, userId, name, type',
      budgets: 'id, userId, category, period, year, month'
    })

    // 数据库升级处理
    this.on('ready', () => {
      // 不再自动初始化默认数据，需要用户登录后手动初始化
      return Promise.resolve()
    })
  }

  // 为指定用户初始化默认数据
  async initializeDefaultDataForUser(userId: string) {
    // 检查用户是否已有数据
    const categoryCount = await this.categories.where('userId').equals(userId).count()
    const accountCount = await this.accounts.where('userId').equals(userId).count()

    if (categoryCount === 0) {
      await this.initializeDefaultCategories(userId)
    }

    if (accountCount === 0) {
      await this.initializeDefaultAccounts(userId)
    }

    // 注释掉默认记录初始化，确保新用户注册后记账数据为0条
    // if (recordCount === 0) {
    //   await this.initializeDefaultRecords(userId)
    // }
  }

  // 初始化默认分类
  private async initializeDefaultCategories(userId: string) {
    const defaultCategories: Omit<Category & { userId: string }, 'id'>[] = [
      // 支出分类
      { name: '餐饮', type: 'expense', icon: '🍽️', color: '#ff6b6b', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '交通', type: 'expense', icon: '🚗', color: '#4ecdc4', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '购物', type: 'expense', icon: '🛍️', color: '#45b7d1', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '娱乐', type: 'expense', icon: '🎮', color: '#96ceb4', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '医疗', type: 'expense', icon: '🏥', color: '#feca57', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '教育', type: 'expense', icon: '📚', color: '#ff9ff3', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '住房', type: 'expense', icon: '🏠', color: '#54a0ff', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '其他', type: 'expense', icon: '📝', color: '#999', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      
      // 收入分类
      { name: '工资', type: 'income', icon: '💼', color: '#2ed573', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '奖金', type: 'income', icon: '🎁', color: '#ffa502', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '投资', type: 'income', icon: '📈', color: '#3742fa', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '兼职', type: 'income', icon: '💻', color: '#2f3542', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '其他', type: 'income', icon: '💰', color: '#999', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]

    for (const category of defaultCategories) {
      await this.categories.add({
        ...category,
        id: uuidv4(),
        userId
      })
    }
  }

  // 初始化默认账户
  private async initializeDefaultAccounts(userId: string) {
    const defaultAccounts: Omit<Account & { userId: string }, 'id'>[] = [
      { name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#52c41a', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#1890ff', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '支付宝', type: 'other', balance: 0, icon: '📱', color: '#1677ff', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: '微信', type: 'other', balance: 0, icon: '💬', color: '#07c160', isDefault: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]

    for (const account of defaultAccounts) {
      await this.accounts.add({
        ...account,
        id: uuidv4(),
        userId
      })
    }
  }

  // 初始化默认记录
  private async initializeDefaultRecords(userId: string) {
    // 获取用户的默认分类和账户
    const categories = await this.categories.where('userId').equals(userId).toArray()
    const accounts = await this.accounts.where('userId').equals(userId).toArray()
    
    if (categories.length === 0 || accounts.length === 0) {
      return
    }

    const defaultAccount = accounts.find(a => a.isDefault) || accounts[0]
    const expenseCategories = categories.filter(c => c.type === 'expense')
    const incomeCategories = categories.filter(c => c.type === 'income')

    const now = new Date()
    const defaultRecords: Omit<Record & { userId: string }, 'id' | 'createdAt' | 'updatedAt'>[] = []
    
    // 生成前5个月的数据
    for (let i = 0; i < 5; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth()
      
      // 每月收入
      defaultRecords.push({
        type: 'income',
        amount: 5000 + Math.random() * 1000, // 5000-6000元
        categoryId: incomeCategories.find(c => c.name === '工资')?.id || incomeCategories[0]?.id || '',
        accountId: defaultAccount.id,
        description: '月薪',
        date: new Date(year, month, 1).toISOString().split('T')[0]
      })
      
      // 随机添加奖金收入（30%概率）
      if (Math.random() < 0.3) {
        defaultRecords.push({
          type: 'income',
          amount: 1000 + Math.random() * 2000, // 1000-3000元
          categoryId: incomeCategories.find(c => c.name === '奖金')?.id || incomeCategories[1]?.id || '',
          accountId: defaultAccount.id,
          description: '绩效奖金',
          date: new Date(year, month, 15).toISOString().split('T')[0]
        })
      }
      
      // 每月支出记录
      const expenseData = [
        { amount: 800 + Math.random() * 400, category: '餐饮', desc: '餐费' },
        { amount: 300 + Math.random() * 200, category: '交通', desc: '交通费' },
        { amount: 500 + Math.random() * 500, category: '购物', desc: '购物' },
        { amount: 200 + Math.random() * 300, category: '娱乐', desc: '娱乐' },
        { amount: 100 + Math.random() * 200, category: '其他', desc: '其他支出' }
      ]
      
      expenseData.forEach((expense, index) => {
        defaultRecords.push({
          type: 'expense',
          amount: Math.round(expense.amount),
          categoryId: expenseCategories.find(c => c.name === expense.category)?.id || expenseCategories[0]?.id || '',
          accountId: defaultAccount.id,
          description: expense.desc,
          date: new Date(year, month, 5 + index * 5).toISOString().split('T')[0]
        })
      })
    }

    for (const record of defaultRecords) {
      if (record.categoryId && record.accountId) {
        const recordId = uuidv4()
        await this.records.add({
          ...record,
          id: recordId,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  // 用户认证相关方法
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = uuidv4()
    await this.users.add({
      ...userData,
      id: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    // 为新用户初始化默认数据
    await this.initializeDefaultDataForUser(userId)
    
    return userId
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.users.where('username').equals(username).first()
  }

  async getUserById(id: string): Promise<User | undefined> {
    return await this.users.get(id)
  }
}

// 创建数据库实例
export const db = new AccountingDatabase()

// 数据库服务类
export class DatabaseService {
  // 记录相关操作
  static async addRecord(recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    const now = new Date().toISOString()
    const record: Record & { userId: string } = {
      ...recordData,
      id: uuidv4(),
      userId,
      createdAt: now,
      updatedAt: now
    }
    
    await db.records.add(record)
    
    // 更新账户余额
    await this.updateAccountBalance(record.accountId, record.amount, record.type, userId)
    
    return record.id
  }

  static async updateRecord(id: string, updates: Partial<Record>, userId: string): Promise<void> {
    const existingRecord = await db.records.where({ id, userId }).first()
    if (!existingRecord) {
      throw new Error('记录不存在')
    }

    // 如果金额或账户发生变化，需要更新账户余额
    if (updates.amount !== undefined || updates.accountId !== undefined || updates.type !== undefined) {
      // 撤销原有的余额变化
      await this.updateAccountBalance(existingRecord.accountId, -existingRecord.amount, existingRecord.type, userId)
      
      // 应用新的余额变化
      const newAmount = updates.amount ?? existingRecord.amount
      const newAccount = updates.accountId ?? existingRecord.accountId
      const newType = updates.type ?? existingRecord.type
      await this.updateAccountBalance(newAccount, newAmount, newType, userId)
    }

    await db.records.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  static async deleteRecord(id: string, userId: string): Promise<void> {
    const record = await db.records.where({ id, userId }).first()
    if (record) {
      // 撤销账户余额变化
      await this.updateAccountBalance(record.accountId, -record.amount, record.type, userId)
      await db.records.delete(id)
    }
  }

  static async getRecords(userId: string, filters?: {
    type?: 'income' | 'expense'
    category?: string
    account?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<Record[]> {
    let query = db.records.where('userId').equals(userId).reverse()

    if (filters?.type) {
      query = query.filter(record => record.type === filters.type)
    }

    if (filters?.category) {
      query = query.filter(record => record.categoryId === filters.category)
    }

    if (filters?.account) {
      query = query.filter(record => record.accountId === filters.account)
    }

    if (filters?.startDate) {
      const startDateStr = filters.startDate.toISOString().split('T')[0] // 只取日期部分
      query = query.filter(record => record.date >= startDateStr)
    }

    if (filters?.endDate) {
      const endDateStr = filters.endDate.toISOString().split('T')[0] // 只取日期部分
      query = query.filter(record => record.date <= endDateStr)
    }

    const results = await query.toArray()
    
    // 按日期排序
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (filters?.limit) {
      return results.slice(0, filters.limit)
    }

    return results
  }

  // 分类相关操作
  static async getCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]> {
    let query = db.categories.where('userId').equals(userId)
    
    if (type) {
      const results = await query.toArray()
      return results.filter(category => category.type === type)
    }
    return await query.toArray()
  }

  static async addCategory(categoryData: Omit<Category, 'id'>, userId: string): Promise<string> {
    const category: Category & { userId: string } = {
      ...categoryData,
      id: uuidv4(),
      userId
    }
    
    await db.categories.add(category)
    return category.id
  }

  // 账户相关操作
  static async getAccounts(userId: string): Promise<Account[]> {
    return await db.accounts.where('userId').equals(userId).toArray()
  }

  static async updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense', userId: string): Promise<void> {
    const account = await db.accounts.where({ id: accountId, userId }).first()
    if (account) {
      const balanceChange = type === 'income' ? amount : -amount
      await db.accounts.update(account.id, {
        balance: account.balance + balanceChange
      })
    }
  }

  // 统计相关操作
  static async getMonthlyStatistics(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const records = await db.records
      .where('userId')
      .equals(userId)
      .filter(record => record.date >= startDate && record.date <= endDate)
      .toArray()

    const totalIncome = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const totalExpense = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    const incomeCount = records.filter(r => r.type === 'income').length
    const expenseCount = records.filter(r => r.type === 'expense').length

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      incomeCount,
      expenseCount,
      balance: totalIncome - totalExpense
    }
  }

  static async getCategoryStatistics(userId: string, startDate: Date, endDate: Date, type: 'income' | 'expense' = 'expense') {
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    const records = await db.records
      .where('userId')
      .equals(userId)
      .filter(record => record.date >= startDateStr && record.date <= endDateStr && record.type === type)
      .toArray()

    const categoryMap = new Map<string, { amount: number; count: number }>()
    
    records.forEach(record => {
      const existing = categoryMap.get(record.categoryId) || { amount: 0, count: 0 }
      categoryMap.set(record.categoryId, {
        amount: existing.amount + record.amount,
        count: existing.count + 1
      })
    })

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0)
    const categories = await this.getCategories(userId, type)
    
    return Array.from(categoryMap.entries()).map(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId)
      return {
        categoryId,
        type,
        amount: data.amount,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
        count: data.count
      }
    }).sort((a, b) => b.amount - a.amount)
  }

  // 数据备份和恢复
  static async exportData(userId: string): Promise<string> {
    const records = await db.records.where('userId').equals(userId).toArray()
    const categories = await db.categories.where('userId').equals(userId).toArray()
    const accounts = await db.accounts.where('userId').equals(userId).toArray()
    const budgets = await db.budgets.where('userId').equals(userId).toArray()

    const data = {
      records,
      categories,
      accounts,
      budgets,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }

    return JSON.stringify(data, null, 2)
  }

  static async importData(jsonData: string, userId: string, clearExisting: boolean = false): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      await db.transaction('rw', [db.records, db.categories, db.accounts, db.budgets], async () => {
        // 只有在明确要求清空时才清空现有数据
        if (clearExisting) {
          await db.records.where('userId').equals(userId).delete()
          await db.categories.where('userId').equals(userId).delete()
          await db.accounts.where('userId').equals(userId).delete()
          await db.budgets.where('userId').equals(userId).delete()
        }
        
        // 导入新数据，确保添加 userId，并避免重复
        if (data.categories) {
          for (const cat of data.categories) {
            const categoryWithUserId = { ...cat, userId }
            // 检查是否已存在相同名称的分类
            const existing = await db.categories
              .where('[userId+name+type]')
              .equals([userId, cat.name, cat.type])
              .first()
            
            if (!existing) {
              await db.categories.add(categoryWithUserId)
            }
          }
        }
        
        if (data.accounts) {
          for (const acc of data.accounts) {
            const accountWithUserId = { ...acc, userId }
            // 检查是否已存在相同名称的账户
            const existing = await db.accounts
              .where('[userId+name]')
              .equals([userId, acc.name])
              .first()
            
            if (!existing) {
              await db.accounts.add(accountWithUserId)
            }
          }
        }
        
        if (data.budgets) {
          for (const budget of data.budgets) {
            const budgetWithUserId = { ...budget, userId }
            // 检查是否已存在相同的预算
            const existing = await db.budgets
              .where('[userId+categoryId+year+month]')
              .equals([userId, budget.categoryId, budget.year, budget.month])
              .first()
            
            if (!existing) {
              await db.budgets.add(budgetWithUserId)
            }
          }
        }
        
        if (data.records) {
          for (const record of data.records) {
            const recordWithUserId = { ...record, userId }
            // 记录通常允许重复，但可以根据需要添加去重逻辑
            await db.records.add(recordWithUserId)
          }
        }
      })
    } catch (error) {
      throw new Error('数据格式错误，导入失败')
    }
  }

  static async clearUserData(userId: string): Promise<void> {
    await db.transaction('rw', [db.records, db.categories, db.accounts, db.budgets], async () => {
      await db.records.where('userId').equals(userId).delete()
      await db.categories.where('userId').equals(userId).delete()
      await db.accounts.where('userId').equals(userId).delete()
      await db.budgets.where('userId').equals(userId).delete()
    })
  }

  static async resetUserDatabase(userId: string): Promise<void> {
    await this.clearUserData(userId)
    // 重新初始化用户默认数据
    await db.initializeDefaultDataForUser(userId)
  }

  // 检查并初始化用户默认数据（如果不存在）
  static async ensureUserDefaultData(userId: string): Promise<void> {
    const categories = await this.getCategories(userId)
    const accounts = await this.getAccounts(userId)
    
    // 如果用户没有分类或账户，初始化默认数据
    if (categories.length === 0 || accounts.length === 0) {
      await db.initializeDefaultDataForUser(userId)
    }
  }

  // 管理员功能：清空所有数据（包括用户）
  static async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.users, db.records, db.categories, db.accounts, db.budgets], async () => {
      await db.users.clear()
      await db.records.clear()
      await db.categories.clear()
      await db.accounts.clear()
      await db.budgets.clear()
    })
  }
}