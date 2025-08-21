// 简化的数据库模拟实现
import type { Record, Category, Account, Budget, MonthlyStats, CategoryStats } from '../types'

// 数据库键名常量
const DB_KEYS = {
  RECORDS: 'accounting_records',
  CATEGORIES: 'accounting_categories',
  ACCOUNTS: 'accounting_accounts',
  BUDGETS: 'accounting_budgets',
  SETTINGS: 'accounting_settings'
} as const

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 获取当前时间字符串
export function getCurrentTime(): string {
  return new Date().toISOString()
}

// 本地存储操作
class LocalStorage {
  static get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return []
    }
  }

  static set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
    }
  }

  static clear(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error)
    }
  }
}

// 记录数据库操作
export class RecordDB {
  static async getAll(): Promise<Record[]> {
    return LocalStorage.get<Record>(DB_KEYS.RECORDS)
  }

  static async getById(id: string): Promise<Record | null> {
    const records = await this.getAll()
    return records.find(record => record.id === id) || null
  }

  static async create(record: Omit<Record, 'id'>): Promise<Record> {
    const records = await this.getAll()
    const newRecord: Record = {
      ...record,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    }
    records.push(newRecord)
    LocalStorage.set(DB_KEYS.RECORDS, records)
    return newRecord
  }

  static async update(id: string, updates: Partial<Record>): Promise<Record | null> {
    const records = await this.getAll()
    const index = records.findIndex(record => record.id === id)
    if (index === -1) return null

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: getCurrentTime()
    }
    LocalStorage.set(DB_KEYS.RECORDS, records)
    return records[index]
  }

  static async delete(id: string): Promise<boolean> {
    const records = await this.getAll()
    const index = records.findIndex(record => record.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    LocalStorage.set(DB_KEYS.RECORDS, records)
    return true
  }

  static async query(params: {
    type?: 'income' | 'expense'
    categoryId?: string
    accountId?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<Record[]> {
    let records = await this.getAll()

    // 按类型筛选
    if (params.type) {
      records = records.filter(record => record.type === params.type)
    }

    // 按分类筛选
    if (params.categoryId) {
      records = records.filter(record => record.categoryId === params.categoryId)
    }

    // 按账户筛选
    if (params.accountId) {
      records = records.filter(record => record.accountId === params.accountId)
    }

    // 按日期范围筛选
    if (params.startDate) {
      records = records.filter(record => record.date >= params.startDate!)
    }
    if (params.endDate) {
      records = records.filter(record => record.date <= params.endDate!)
    }

    // 按关键词搜索
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      records = records.filter(record => 
        record.note?.toLowerCase().includes(searchLower)
      )
    }

    // 按日期倒序排列
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // 分页
    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit
      const end = start + params.limit
      records = records.slice(start, end)
    }

    return records
  }

  static async clear(): Promise<void> {
    LocalStorage.clear(DB_KEYS.RECORDS)
  }
}

// 分类数据库操作
export class CategoryDB {
  static async getAll(): Promise<Category[]> {
    const categories = LocalStorage.get<Category>(DB_KEYS.CATEGORIES)
    if (categories.length === 0) {
      // 初始化默认分类
      const defaultCategories = await this.initDefaultCategories()
      return defaultCategories
    }
    return categories
  }

  static async getById(id: string): Promise<Category | null> {
    const categories = await this.getAll()
    return categories.find(category => category.id === id) || null
  }

  static async create(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.getAll()
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    }
    categories.push(newCategory)
    LocalStorage.set(DB_KEYS.CATEGORIES, categories)
    return newCategory
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = await this.getAll()
    const index = categories.findIndex(category => category.id === id)
    if (index === -1) return null

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: getCurrentTime()
    }
    LocalStorage.set(DB_KEYS.CATEGORIES, categories)
    return categories[index]
  }

  static async delete(id: string): Promise<boolean> {
    const categories = await this.getAll()
    const index = categories.findIndex(category => category.id === id)
    if (index === -1) return false

    categories.splice(index, 1)
    LocalStorage.set(DB_KEYS.CATEGORIES, categories)
    return true
  }

  static async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    const categories = await this.getAll()
    return categories.filter(category => category.type === type)
  }

  static async initDefaultCategories(): Promise<Category[]> {
    const defaultCategories: Omit<Category, 'id'>[] = [
      // 支出分类
      { name: '餐饮', type: 'expense', icon: 'food-o', color: '#ff6b6b', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '交通', type: 'expense', icon: 'logistics', color: '#4ecdc4', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '购物', type: 'expense', icon: 'shopping-cart-o', color: '#45b7d1', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '娱乐', type: 'expense', icon: 'music-o', color: '#f9ca24', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '医疗', type: 'expense', icon: 'cross', color: '#f0932b', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '教育', type: 'expense', icon: 'certificate', color: '#eb4d4b', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '住房', type: 'expense', icon: 'home-o', color: '#6c5ce7', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '其他', type: 'expense', icon: 'ellipsis', color: '#a4b0be', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      
      // 收入分类
      { name: '工资', type: 'income', icon: 'gold-coin-o', color: '#2ed573', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '奖金', type: 'income', icon: 'gift-o', color: '#ffa502', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '投资', type: 'income', icon: 'chart-trending-o', color: '#3742fa', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '兼职', type: 'income', icon: 'bag-o', color: '#2f3542', createdAt: getCurrentTime(), updatedAt: getCurrentTime() },
      { name: '其他', type: 'income', icon: 'plus', color: '#57606f', createdAt: getCurrentTime(), updatedAt: getCurrentTime() }
    ]

    const categories: Category[] = []
    for (const categoryData of defaultCategories) {
      const newCategory: Category = {
        ...categoryData,
        id: generateId()
      }
      categories.push(newCategory)
    }
    
    // 直接保存到localStorage，避免递归调用
    LocalStorage.set(DB_KEYS.CATEGORIES, categories)
    return categories
  }

  static async clear(): Promise<void> {
    LocalStorage.clear(DB_KEYS.CATEGORIES)
  }
}

// 账户数据库操作
export class AccountDB {
  static async getAll(): Promise<Account[]> {
    const accounts = LocalStorage.get<Account>(DB_KEYS.ACCOUNTS)
    if (accounts.length === 0) {
      // 初始化默认账户
      const defaultAccounts = await this.initDefaultAccounts()
      return defaultAccounts
    }
    return accounts
  }

  static async getById(id: string): Promise<Account | null> {
    const accounts = await this.getAll()
    return accounts.find(account => account.id === id) || null
  }

  static async create(account: Omit<Account, 'id'>): Promise<Account> {
    const accounts = await this.getAll()
    const newAccount: Account = {
      ...account,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    }
    accounts.push(newAccount)
    LocalStorage.set(DB_KEYS.ACCOUNTS, accounts)
    return newAccount
  }

  static async update(id: string, updates: Partial<Account>): Promise<Account | null> {
    const accounts = await this.getAll()
    const index = accounts.findIndex(account => account.id === id)
    if (index === -1) return null

    accounts[index] = {
      ...accounts[index],
      ...updates,
      updatedAt: getCurrentTime()
    }
    LocalStorage.set(DB_KEYS.ACCOUNTS, accounts)
    return accounts[index]
  }

  static async delete(id: string): Promise<boolean> {
    const accounts = await this.getAll()
    const index = accounts.findIndex(account => account.id === id)
    if (index === -1) return false

    accounts.splice(index, 1)
    LocalStorage.set(DB_KEYS.ACCOUNTS, accounts)
    return true
  }

  static async initDefaultAccounts(): Promise<Account[]> {
    const defaultAccounts: Omit<Account, 'id'>[] = [
      { 
        name: '现金', 
        type: 'cash', 
        balance: 0, 
        icon: 'cash', 
        color: '#2ed573',
        isDefault: true,
        createdAt: getCurrentTime(), 
        updatedAt: getCurrentTime() 
      },
      { 
        name: '银行卡', 
        type: 'bank', 
        balance: 0, 
        icon: 'credit-pay', 
        color: '#3742fa',
        isDefault: false,
        createdAt: getCurrentTime(), 
        updatedAt: getCurrentTime() 
      },
      { 
        name: '支付宝', 
        type: 'digital', 
        balance: 0, 
        icon: 'alipay', 
        color: '#1890ff',
        isDefault: false,
        createdAt: getCurrentTime(), 
        updatedAt: getCurrentTime() 
      },
      { 
        name: '微信', 
        type: 'digital', 
        balance: 0, 
        icon: 'wechat-pay', 
        color: '#52c41a',
        isDefault: false,
        createdAt: getCurrentTime(), 
        updatedAt: getCurrentTime() 
      }
    ]

    const accounts: Account[] = []
    for (const accountData of defaultAccounts) {
      const account: Account = {
        ...accountData,
        id: generateId()
      }
      accounts.push(account)
    }
    
    // 直接保存到LocalStorage，避免递归调用
    LocalStorage.set(DB_KEYS.ACCOUNTS, accounts)
    return accounts
  }

  static async clear(): Promise<void> {
    LocalStorage.clear(DB_KEYS.ACCOUNTS)
  }
}

// 预算数据库操作
export class BudgetDB {
  static async getAll(): Promise<Budget[]> {
    return LocalStorage.get<Budget>(DB_KEYS.BUDGETS)
  }

  static async getById(id: string): Promise<Budget | null> {
    const budgets = await this.getAll()
    return budgets.find(budget => budget.id === id) || null
  }

  static async create(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const budgets = await this.getAll()
    const newBudget: Budget = {
      ...budget,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    }
    budgets.push(newBudget)
    LocalStorage.set(DB_KEYS.BUDGETS, budgets)
    return newBudget
  }

  static async update(id: string, updates: Partial<Budget>): Promise<Budget | null> {
    const budgets = await this.getAll()
    const index = budgets.findIndex(budget => budget.id === id)
    if (index === -1) return null

    budgets[index] = {
      ...budgets[index],
      ...updates,
      updatedAt: getCurrentTime()
    }
    LocalStorage.set(DB_KEYS.BUDGETS, budgets)
    return budgets[index]
  }

  static async delete(id: string): Promise<boolean> {
    const budgets = await this.getAll()
    const index = budgets.findIndex(budget => budget.id === id)
    if (index === -1) return false

    budgets.splice(index, 1)
    LocalStorage.set(DB_KEYS.BUDGETS, budgets)
    return true
  }

  static async clear(): Promise<void> {
    LocalStorage.clear(DB_KEYS.BUDGETS)
  }
}

// 统计数据计算
export class StatsDB {
  static async getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
    
    const records = await RecordDB.query({ startDate, endDate })
    
    const income = records
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const expense = records
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const incomeCount = records.filter(record => record.type === 'income').length
    const expenseCount = records.filter(record => record.type === 'expense').length
    
    return {
      year,
      month,
      income,
      expense,
      balance: income - expense,
      incomeCount,
      expenseCount
    }
  }

  static async getCategoryStats(
    year: number, 
    month: number, 
    type?: 'income' | 'expense'
  ): Promise<CategoryStats[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
    
    const records = await RecordDB.query({ startDate, endDate, type })
    const categories = await CategoryDB.getAll()
    
    const statsMap = new Map<string, CategoryStats>()
    
    records.forEach(record => {
      const category = categories.find(c => c.id === record.categoryId)
      if (!category) return
      
      const key = record.categoryId
      if (statsMap.has(key)) {
        const stats = statsMap.get(key)!
        stats.amount += record.amount
        stats.count += 1
      } else {
        statsMap.set(key, {
          categoryId: record.categoryId,
          categoryName: category.name,
          type: record.type,
          amount: record.amount,
          count: 1,
          percentage: 0
        })
      }
    })
    
    const stats = Array.from(statsMap.values())
    const totalAmount = stats.reduce((sum, stat) => sum + stat.amount, 0)
    
    // 计算百分比
    stats.forEach(stat => {
      stat.percentage = totalAmount > 0 ? (stat.amount / totalAmount) * 100 : 0
    })
    
    // 按金额降序排列
    return stats.sort((a, b) => b.amount - a.amount)
  }
}

// 数据导入导出
export class DataManager {
  static async exportData(): Promise<string> {
    const data = {
      records: await RecordDB.getAll(),
      categories: await CategoryDB.getAll(),
      accounts: await AccountDB.getAll(),
      budgets: await BudgetDB.getAll(),
      exportTime: getCurrentTime(),
      version: '1.0.0'
    }
    return JSON.stringify(data, null, 2)
  }

  static async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.records) {
        LocalStorage.set(DB_KEYS.RECORDS, data.records)
      }
      if (data.categories) {
        LocalStorage.set(DB_KEYS.CATEGORIES, data.categories)
      }
      if (data.accounts) {
        LocalStorage.set(DB_KEYS.ACCOUNTS, data.accounts)
      }
      if (data.budgets) {
        LocalStorage.set(DB_KEYS.BUDGETS, data.budgets)
      }
      
      return true
    } catch (error) {
      console.error('Import data error:', error)
      return false
    }
  }

  static async clearAllData(): Promise<void> {
    await RecordDB.clear()
    await CategoryDB.clear()
    await AccountDB.clear()
    await BudgetDB.clear()
  }
}

// 数据库初始化
export async function initDatabase(): Promise<void> {
  try {
    // 确保默认分类和账户存在
    await CategoryDB.getAll()
    await AccountDB.getAll()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}