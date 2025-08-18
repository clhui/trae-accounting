import { supabase, handleSupabaseError, SyncStatus, type SyncResult, isSupabaseEnabled } from './supabase'
import type { User, Record, Category, Account, Budget, RecordFilters, MonthlyStats, CategoryStats } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { db } from './database'

// 云端API服务类
export class CloudApiService {
  // 用户认证相关 - 包装器方法
  static async register(userData: { username: string; email?: string; password: string }) {
    try {
      const email = userData.email || `${userData.username}@local.app`
      const result = await this.signUp(email, userData.password, userData.username)
      
      if (result.user) {
        // 初始化用户默认数据
        await this.initializeUserDefaultData(result.user.id)
      }
      
      return {
        success: true,
        user: result.user,
        message: '注册成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '注册失败'
      }
    }
  }

  static async login(credentials: { username: string; password: string }) {
    try {
      // 如果用户名不包含@，则添加默认域名
      const email = credentials.username.includes('@') 
        ? credentials.username 
        : `${credentials.username}@local.app`
      
      const result = await this.signIn(email, credentials.password)
      
      if (result.user) {
        const userData = await this.getCurrentUser()
        return {
          success: true,
          user: userData,
          token: result.session?.access_token,
          message: '登录成功'
        }
      }
      
      return {
        success: false,
        message: '登录失败'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '登录失败'
      }
    }
  }

  static async signUp(email: string, password: string, username: string) {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (authError) throw authError

      // 创建用户记录
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (userError) throw userError
      }

      return authData
    } catch (error) {
      const errorInfo = handleSupabaseError(error)
      throw new Error(errorInfo.message)
    }
  }

  static async signIn(email: string, password: string) {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      const errorInfo = handleSupabaseError(error)
      throw new Error(errorInfo.message)
    }
  }

  static async signOut() {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      const errorInfo = handleSupabaseError(error)
      throw new Error(errorInfo.message)
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseEnabled || !supabase) {
      return null
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      }
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  // 记录相关操作
  static async getRecords(userId: string, filters?: RecordFilters): Promise<Record[]> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }
    
    try {
      let query = supabase
        .from('records')
        .select(`
          *,
          categories!inner(name, type, icon, color),
          accounts!inner(name, type, icon, color)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId)
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(record => ({
        id: record.id,
        type: record.type,
        amount: record.amount,
        categoryId: record.category_id,
        accountId: record.account_id,
        description: record.description || '',
        date: record.date,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }))
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  static async addRecord(userId: string, record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>): Promise<Record> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }
    
    try {
      const newRecord = {
        id: uuidv4(),
        user_id: userId,
        type: record.type,
        amount: record.amount,
        category_id: record.categoryId,
        account_id: record.accountId,
        description: record.description,
        date: record.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('records')
        .insert(newRecord)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        type: data.type,
        amount: data.amount,
        categoryId: data.category_id,
        accountId: data.account_id,
        description: data.description || '',
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateRecord(userId: string, recordId: string, updates: Partial<Record>): Promise<Record> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }

      if (updates.type) updateData.type = updates.type
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.categoryId) updateData.category_id = updates.categoryId
      if (updates.accountId) updateData.account_id = updates.accountId
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.date) updateData.date = updates.date

      const { data, error } = await supabase
        .from('records')
        .update(updateData)
        .eq('id', recordId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        type: data.type,
        amount: data.amount,
        categoryId: data.category_id,
        accountId: data.account_id,
        description: data.description || '',
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  static async deleteRecord(userId: string, recordId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // 分类相关操作
  static async getCategories(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(category => ({
        id: category.id,
        name: category.name,
        type: category.type,
        icon: category.icon || '',
        color: category.color || '',
        isDefault: category.is_default,
        createdAt: category.created_at,
        updatedAt: category.updated_at
      }))
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  static async addCategory(userId: string, category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const newCategory = {
        id: uuidv4(),
        user_id: userId,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        is_default: category.isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        icon: data.icon || '',
        color: data.color || '',
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // 账户相关操作
  static async getAccounts(userId: string): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        icon: account.icon || '',
        color: account.color || '',
        isDefault: account.is_default,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }))
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // 统计相关操作
  static async getMonthlyStatistics(userId: string, year: number, month: number): Promise<MonthlyStats> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('records')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const income = data
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0)

      const expense = data
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0)

      return {
        year,
        month,
        income,
        expense,
        balance: income - expense,
        recordCount: data.length
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getCategoryStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: 'income' | 'expense' = 'expense'
  ): Promise<CategoryStats[]> {
    try {
      const { data, error } = await supabase
        .from('records')
        .select(`
          amount,
          categories!inner(id, name, icon, color)
        `)
        .eq('user_id', userId)
        .eq('type', type)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error

      const categoryMap = new Map<string, CategoryStats>()

      data.forEach(record => {
        const category = record.categories
        if (!category) return

        const existing = categoryMap.get(category.id)
        if (existing) {
          existing.amount += record.amount
          existing.count += 1
        } else {
          categoryMap.set(category.id, {
            categoryId: category.id,
            categoryName: category.name,
            amount: record.amount,
            count: 1,
            icon: category.icon || '',
            color: category.color || ''
          })
        }
      })

      const result = Array.from(categoryMap.values())
      const total = result.reduce((sum, item) => sum + item.amount, 0)

      return result.map(item => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0
      })).sort((a, b) => b.amount - a.amount)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // 数据同步相关
  static async syncUserData(userId: string): Promise<SyncResult> {
    try {
      let uploadCount = 0
      let downloadCount = 0
      let conflictCount = 0

      // 1. 获取本地数据的最后更新时间
      const lastSyncTime = localStorage.getItem(`lastSync_${userId}`)
      const lastSync = lastSyncTime ? new Date(lastSyncTime) : new Date(0)

      // 2. 从云端获取更新的数据
      const { data: cloudRecords } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSync.toISOString())

      const { data: cloudCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSync.toISOString())

      const { data: cloudAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSync.toISOString())

      // 3. 处理下载的数据
      if (cloudRecords?.length) {
        downloadCount += cloudRecords.length
      }

      if (cloudCategories?.length) {
        downloadCount += cloudCategories.length
      }

      if (cloudAccounts?.length) {
        downloadCount += cloudAccounts.length
      }

      // 4. 更新最后同步时间
      localStorage.setItem(`lastSync_${userId}`, new Date().toISOString())

      return {
        status: SyncStatus.SUCCESS,
        message: `同步完成：上传 ${uploadCount} 条，下载 ${downloadCount} 条，冲突 ${conflictCount} 条`,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        status: SyncStatus.ERROR,
        message: handleSupabaseError(error),
        timestamp: new Date()
      }
    }
  }

  // 初始化用户默认数据
  static async initializeUserDefaultData(userId: string): Promise<void> {
    try {
      // 检查用户是否已有数据
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (categories && categories.length > 0) {
        return // 用户已有数据，不需要初始化
      }

      // 初始化默认分类
      const defaultCategories = [
        { name: '餐饮', type: 'expense', icon: '🍽️', color: '#ff6b6b', is_default: true },
        { name: '交通', type: 'expense', icon: '🚗', color: '#4ecdc4', is_default: true },
        { name: '购物', type: 'expense', icon: '🛍️', color: '#45b7d1', is_default: true },
        { name: '娱乐', type: 'expense', icon: '🎮', color: '#96ceb4', is_default: true },
        { name: '工资', type: 'income', icon: '💰', color: '#52c41a', is_default: true },
        { name: '奖金', type: 'income', icon: '🎁', color: '#faad14', is_default: true }
      ].map(cat => ({
        id: uuidv4(),
        user_id: userId,
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }))

      await supabase.from('categories').insert(defaultCategories)

      // 初始化默认账户
      const defaultAccounts = [
        { name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#52c41a', is_default: true },
        { name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#1890ff', is_default: true },
        { name: '支付宝', type: 'other', balance: 0, icon: '📱', color: '#1677ff', is_default: true },
        { name: '微信', type: 'other', balance: 0, icon: '💬', color: '#07c160', is_default: true }
      ].map(acc => ({
        id: uuidv4(),
        user_id: userId,
        ...acc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }))

      await supabase.from('accounts').insert(defaultAccounts)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  }

  // 数据同步辅助方法
  static async uploadRecordToCloud(record: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('records')
        .upsert({
          id: record.id,
          user_id: userId,
          type: record.type,
          amount: record.amount,
          category_id: record.categoryId,
          account_id: record.accountId,
          date: record.date,
          description: record.description,
          created_at: record.createdAt,
          updated_at: record.updatedAt,
          synced_at: new Date().toISOString()
        })
      
      return !error
    } catch (error) {
      console.error('上传记录到云端失败:', error)
      return false
    }
  }

  static async uploadCategoryToCloud(category: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .upsert({
          id: category.id,
          user_id: userId,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
          is_default: category.isDefault,
          created_at: category.createdAt,
          updated_at: category.updatedAt || category.createdAt,
          synced_at: new Date().toISOString()
        })
      
      return !error
    } catch (error) {
      console.error('上传分类到云端失败:', error)
      return false
    }
  }

  static async uploadAccountToCloud(account: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('accounts')
        .upsert({
          id: account.id,
          user_id: userId,
          name: account.name,
          type: account.type,
          balance: account.balance,
          icon: account.icon,
          color: account.color,
          is_default: account.isDefault,
          created_at: account.createdAt,
          updated_at: account.updatedAt || account.createdAt,
          synced_at: new Date().toISOString()
        })
      
      return !error
    } catch (error) {
      console.error('上传账户到云端失败:', error)
      return false
    }
  }

  static async resolveConflict(localData: any, cloudData: any, type: 'record' | 'category' | 'account'): Promise<any> {
    // 简单的冲突解决策略：使用最新更新时间
    const localTime = new Date(localData.updated_at || localData.updatedAt).getTime()
    const cloudTime = new Date(cloudData.updated_at || cloudData.updatedAt).getTime()
    
    return cloudTime > localTime ? cloudData : localData
  }

  // 数据导入导出
  static async exportData(userId: string): Promise<string> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }

    try {
      const [records, categories, accounts] = await Promise.all([
        this.getRecords(userId),
        this.getCategories(userId),
        this.getAccounts(userId)
      ])

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userId,
        data: {
          records,
          categories,
          accounts
        }
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      throw new Error(`导出数据失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  static async importData(jsonData: string, userId: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }

    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.data) {
        throw new Error('无效的导入数据格式')
      }

      const { records, categories, accounts } = importData.data

      // 清空现有数据
      await this.clearUserData(userId)

      // 导入分类
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          await this.addCategory(userId, {
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
          })
        }
      }

      // 导入账户
      if (accounts && Array.isArray(accounts)) {
        for (const account of accounts) {
          await supabase
            .from('accounts')
            .insert({
              id: account.id || uuidv4(),
              user_id: userId,
              name: account.name,
              type: account.type,
              balance: account.balance || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }
      }

      // 导入记录
      if (records && Array.isArray(records)) {
        for (const record of records) {
          await this.addRecord(userId, {
            amount: record.amount,
            type: record.type,
            categoryId: record.categoryId,
            accountId: record.accountId,
            description: record.description,
            date: record.date
          })
        }
      }

    } catch (error) {
      throw new Error(`导入数据失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  static async clearUserData(userId: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('云端服务未配置')
    }

    try {
      // 删除用户的所有数据
      await Promise.all([
        supabase.from('records').delete().eq('user_id', userId),
        supabase.from('categories').delete().eq('user_id', userId),
        supabase.from('accounts').delete().eq('user_id', userId),
        supabase.from('budgets').delete().eq('user_id', userId)
      ])
    } catch (error) {
      throw new Error(`清空用户数据失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  static async resetUserDatabase(userId: string): Promise<void> {
    await this.clearUserData(userId)
    await this.initializeUserDefaultData(userId)
  }
}