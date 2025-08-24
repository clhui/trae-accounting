import { DatabaseService as LocalDatabaseService } from './database'
import { CloudApiService } from './cloudApi'
import { supabase, isOnline, isSupabaseConnected, isSupabaseEnabled } from './supabase'
import { Record, Category, Account, Budget, User } from '../types'
import { SyncResult } from '../types/supabase'

// 数据存储模式
export type StorageMode = 'local' | 'cloud' | 'hybrid'

// 混合数据库服务配置
interface HybridDatabaseConfig {
  mode: StorageMode
  autoSync: boolean
  syncInterval: number // 自动同步间隔（毫秒）
  offlineMode: boolean
}

// 默认配置
const DEFAULT_CONFIG: HybridDatabaseConfig = {
  mode: 'hybrid',
  autoSync: true,
  syncInterval: 5 * 60 * 1000, // 5分钟
  offlineMode: false
}

/**
 * 混合数据库服务
 * 支持本地IndexedDB和云端Supabase的智能切换
 */
export class HybridDatabaseService {
  private static config: HybridDatabaseConfig = { ...DEFAULT_CONFIG }
  private static cloudApi: CloudApiService | null = null
  private static syncTimer: NodeJS.Timeout | null = null
  private static lastSyncTime: Date | null = null

  /**
   * 初始化混合数据库服务
   */
  static async initialize(config?: Partial<HybridDatabaseConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // 初始化云端API服务
    if (this.config.mode !== 'local' && isSupabaseEnabled) {
      this.cloudApi = new CloudApiService()
    }

    // 启动自动同步
    if (this.config.autoSync && this.config.mode === 'hybrid' && isSupabaseEnabled) {
      this.startAutoSync()
    }
  }

  /**
   * 获取当前存储模式
   */
  static getCurrentMode(): StorageMode {
    if (this.config.mode === 'local') return 'local'
    if (this.config.mode === 'cloud') return 'cloud'
    
    // hybrid模式下根据网络状态和Supabase配置决定
    if (!isSupabaseEnabled || !isOnline() || !isSupabaseConnected()) {
      return 'local'
    }
    return 'cloud'
  }

  /**
   * 设置存储模式
   */
  static setMode(mode: StorageMode) {
    this.config.mode = mode
    
    if (mode === 'local') {
      this.stopAutoSync()
    } else if (mode === 'hybrid' && this.config.autoSync) {
      this.startAutoSync()
    }
  }

  /**
   * 启动自动同步
   */
  private static startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(async () => {
      try {
        await this.syncData()
      } catch (error) {
        console.warn('自动同步失败:', error)
      }
    }, this.config.syncInterval)
  }

  /**
   * 停止自动同步
   */
  private static stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * 数据同步
   */
  static async syncData(userId?: string): Promise<SyncResult> {
    if (!this.cloudApi || !userId) {
      return {
        success: false,
        message: '云端服务未初始化或用户未登录',
        uploadCount: 0,
        downloadCount: 0,
        conflictCount: 0
      }
    }

    try {
      const result = await this.cloudApi.syncData(userId)
      this.lastSyncTime = new Date()
      return result
    } catch (error) {
      console.error('数据同步失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '同步失败',
        uploadCount: 0,
        downloadCount: 0,
        conflictCount: 0
      }
    }
  }

  /**
   * 获取最后同步时间
   */
  static getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  // ==================== 记录相关操作 ====================

  /**
   * 添加记录
   */
  static async addRecord(recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.addRecord(recordData, userId)
      } catch (error) {
        console.warn('云端添加记录失败，使用本地存储:', error)
        return await LocalDatabaseService.addRecord(recordData, userId)
      }
    }
    
    return await LocalDatabaseService.addRecord(recordData, userId)
  }

  /**
   * 更新记录
   */
  static async updateRecord(id: string, updates: Partial<Record>, userId: string): Promise<void> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        await this.cloudApi.updateRecord(id, updates, userId)
        return
      } catch (error) {
        console.warn('云端更新记录失败，使用本地存储:', error)
      }
    }
    
    await LocalDatabaseService.updateRecord(id, updates, userId)
  }

  /**
   * 删除记录
   */
  static async deleteRecord(id: string, userId: string): Promise<void> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        await this.cloudApi.deleteRecord(id, userId)
        return
      } catch (error) {
        console.warn('云端删除记录失败，使用本地存储:', error)
      }
    }
    
    await LocalDatabaseService.deleteRecord(id, userId)
  }

  /**
   * 获取记录列表
   */
  static async getRecords(userId: string, filters?: {
    type?: 'income' | 'expense'
    category?: string
    account?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<Record[]> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.getRecords(userId, filters)
      } catch (error) {
        console.warn('云端获取记录失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.getRecords(userId, filters)
  }

  // ==================== 分类相关操作 ====================

  /**
   * 获取分类列表
   */
  static async getCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.getCategories(userId, type)
      } catch (error) {
        console.warn('云端获取分类失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.getCategories(userId, type)
  }

  /**
   * 添加分类
   */
  static async addCategory(categoryData: Omit<Category, 'id'>, userId: string): Promise<string> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.addCategory(categoryData, userId)
      } catch (error) {
        console.warn('云端添加分类失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.addCategory(categoryData, userId)
  }

  // ==================== 账户相关操作 ====================

  /**
   * 获取账户列表
   */
  static async getAccounts(userId: string): Promise<Account[]> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.getAccounts(userId)
      } catch (error) {
        console.warn('云端获取账户失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.getAccounts(userId)
  }

  /**
   * 更新账户余额
   */
  static async updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense', userId: string): Promise<void> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        // 云端API中账户余额会自动更新
        return
      } catch (error) {
        console.warn('云端更新账户余额失败，使用本地存储:', error)
      }
    }
    
    await LocalDatabaseService.updateAccountBalance(accountId, amount, type, userId)
  }

  // ==================== 统计相关操作 ====================

  /**
   * 获取月度统计
   */
  static async getMonthlyStatistics(userId: string, year: number, month: number) {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.getMonthlyStatistics(userId, year, month)
      } catch (error) {
        console.warn('云端获取月度统计失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.getMonthlyStatistics(userId, year, month)
  }

  /**
   * 获取分类统计
   */
  static async getCategoryStatistics(userId: string, startDate: Date, endDate: Date, type: 'income' | 'expense' = 'expense') {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        return await this.cloudApi.getCategoryStatistics(userId, startDate, endDate, type)
      } catch (error) {
        console.warn('云端获取分类统计失败，使用本地存储:', error)
      }
    }
    
    return await LocalDatabaseService.getCategoryStatistics(userId, startDate, endDate, type)
  }

  // ==================== 数据管理操作 ====================

  /**
   * 导出数据
   */
  static async exportData(userId: string): Promise<string> {
    // 优先从云端导出完整数据
    if (this.cloudApi && isSupabaseEnabled && isOnline() && isSupabaseConnected()) {
      try {
        const records = await this.cloudApi.getRecords(userId)
        const categories = await this.cloudApi.getCategories(userId)
        const accounts = await this.cloudApi.getAccounts(userId)
        
        return JSON.stringify({
          records,
          categories,
          accounts,
          exportTime: new Date().toISOString(),
          source: 'cloud'
        }, null, 2)
      } catch (error) {
        console.warn('云端导出失败，使用本地数据:', error)
      }
    }
    
    return await LocalDatabaseService.exportData(userId)
  }

  /**
   * 导入数据
   */
  static async importData(file: File, userId: string): Promise<any> {
    // 优先使用后端API进行导入，这样可以避免清空现有数据的问题
    if (isOnline()) {
      try {
        const { BackendApiService } = await import('./backendApi')
        const result = await BackendApiService.importData(file)
        
        // 导入成功后同步到本地数据库
        await this.syncData(userId)
        
        return result
      } catch (error) {
        console.warn('使用后端API导入失败，尝试本地导入:', error)
         // 如果后端API失败，回退到本地导入
         const jsonData = await file.text()
         await LocalDatabaseService.importData(jsonData, userId, false)
        
        // 尝试同步到云端
        if (this.cloudApi && isSupabaseEnabled && isSupabaseConnected()) {
          try {
            await this.syncData(userId)
          } catch (syncError) {
            console.warn('导入后同步到云端失败:', syncError)
          }
        }
        
        return { success: true, message: '数据已导入到本地' }
      }
    } else {
      // 离线模式，只导入到本地
       const jsonData = await file.text()
       await LocalDatabaseService.importData(jsonData, userId, false)
      return { success: true, message: '数据已导入到本地（离线模式）' }
    }
  }

  /**
   * 清除用户数据
   */
  static async clearUserData(userId: string): Promise<void> {
    // 同时清除本地和云端数据
    await LocalDatabaseService.clearUserData(userId)
    
    if (this.cloudApi && isSupabaseEnabled && isOnline() && isSupabaseConnected()) {
      try {
        // 这里可以添加云端数据清除逻辑
        console.log('云端数据清除功能待实现')
      } catch (error) {
        console.warn('清除云端数据失败:', error)
      }
    }
  }

  /**
   * 确保用户默认数据
   */
  static async ensureUserDefaultData(userId: string): Promise<void> {
    const currentMode = this.getCurrentMode()
    
    if (currentMode === 'cloud' && this.cloudApi) {
      try {
        await this.cloudApi.initializeUserData(userId)
        return
      } catch (error) {
        console.warn('云端初始化用户数据失败，使用本地存储:', error)
      }
    }
    
    await LocalDatabaseService.ensureUserDefaultData(userId)
  }

  /**
   * 获取配置信息
   */
  static getConfig(): HybridDatabaseConfig {
    return { ...this.config }
  }

  /**
   * 获取同步状态
   */
  static getSyncStatus() {
    return {
      mode: this.getCurrentMode(),
      isOnline: isOnline(),
      isCloudConnected: isSupabaseConnected(),
      isSupabaseEnabled: isSupabaseEnabled,
      lastSyncTime: this.lastSyncTime,
      autoSyncEnabled: this.config.autoSync && this.config.mode === 'hybrid' && isSupabaseEnabled
    }
  }

  /**
   * 销毁服务
   */
  static destroy() {
    this.stopAutoSync()
    this.cloudApi = null
    this.lastSyncTime = null
  }
}

// 导出默认实例
export default HybridDatabaseService