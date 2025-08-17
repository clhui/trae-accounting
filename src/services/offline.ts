import { HybridDatabaseService } from './hybridDatabase'
import { isOnline, isSupabaseConnected } from './supabase'
import { Record, Category, Account } from '../types'

// 离线操作类型
export type OfflineOperationType = 'create' | 'update' | 'delete'

// 离线操作记录
export interface OfflineOperation {
  id: string
  type: OfflineOperationType
  entityType: 'record' | 'category' | 'account'
  entityId: string
  data: any
  timestamp: string
  userId: string
  synced: boolean
}

// 离线状态
export interface OfflineStatus {
  isOffline: boolean
  pendingOperations: number
  lastSyncTime: Date | null
  queueSize: number
}

/**
 * 离线模式支持服务
 * 管理离线操作队列和本地缓存
 */
export class OfflineService {
  private static readonly OFFLINE_QUEUE_KEY = 'offline_operations_queue'
  private static readonly CACHE_PREFIX = 'cache_'
  private static readonly MAX_QUEUE_SIZE = 1000
  private static operationQueue: OfflineOperation[] = []
  private static isProcessing = false

  /**
   * 初始化离线服务
   */
  static async initialize(): Promise<void> {
    // 从localStorage加载离线操作队列
    await this.loadOperationQueue()
    
    // 监听网络状态变化
    this.setupNetworkListeners()
    
    // 如果在线，尝试处理队列
    if (isOnline() && isSupabaseConnected()) {
      await this.processOfflineQueue()
    }
  }

  /**
   * 添加离线操作到队列
   */
  static async addOfflineOperation(
    type: OfflineOperationType,
    entityType: 'record' | 'category' | 'account',
    entityId: string,
    data: any,
    userId: string
  ): Promise<void> {
    const operation: OfflineOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entityType,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      userId,
      synced: false
    }

    this.operationQueue.push(operation)
    
    // 限制队列大小
    if (this.operationQueue.length > this.MAX_QUEUE_SIZE) {
      this.operationQueue = this.operationQueue.slice(-this.MAX_QUEUE_SIZE)
    }

    await this.saveOperationQueue()
    
    console.log(`离线操作已添加到队列: ${type} ${entityType} ${entityId}`)
  }

  /**
   * 处理离线操作队列
   */
  static async processOfflineQueue(): Promise<{ success: number; failed: number }> {
    if (this.isProcessing || !isOnline() || !isSupabaseConnected()) {
      return { success: 0, failed: 0 }
    }

    this.isProcessing = true
    let successCount = 0
    let failedCount = 0

    try {
      const pendingOperations = this.operationQueue.filter(op => !op.synced)
      
      for (const operation of pendingOperations) {
        try {
          await this.executeOfflineOperation(operation)
          operation.synced = true
          successCount++
          console.log(`离线操作同步成功: ${operation.type} ${operation.entityType} ${operation.entityId}`)
        } catch (error) {
          console.error(`离线操作同步失败: ${operation.type} ${operation.entityType} ${operation.entityId}`, error)
          failedCount++
        }
      }

      // 清理已同步的操作
      this.operationQueue = this.operationQueue.filter(op => !op.synced)
      await this.saveOperationQueue()

    } finally {
      this.isProcessing = false
    }

    console.log(`离线队列处理完成: 成功 ${successCount}, 失败 ${failedCount}`)
    return { success: successCount, failed: failedCount }
  }

  /**
   * 执行单个离线操作
   */
  private static async executeOfflineOperation(operation: OfflineOperation): Promise<void> {
    const { type, entityType, entityId, data, userId } = operation

    switch (entityType) {
      case 'record':
        await this.executeRecordOperation(type, entityId, data, userId)
        break
      case 'category':
        await this.executeCategoryOperation(type, entityId, data, userId)
        break
      case 'account':
        await this.executeAccountOperation(type, entityId, data, userId)
        break
      default:
        throw new Error(`未知的实体类型: ${entityType}`)
    }
  }

  /**
   * 执行记录操作
   */
  private static async executeRecordOperation(
    type: OfflineOperationType,
    entityId: string,
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        await HybridDatabaseService.addRecord(data, userId)
        break
      case 'update':
        await HybridDatabaseService.updateRecord(entityId, data, userId)
        break
      case 'delete':
        await HybridDatabaseService.deleteRecord(entityId, userId)
        break
    }
  }

  /**
   * 执行分类操作
   */
  private static async executeCategoryOperation(
    type: OfflineOperationType,
    entityId: string,
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        await HybridDatabaseService.addCategory(data, userId)
        break
      case 'update':
        // 分类更新操作需要在CloudApiService中实现
        console.warn('分类更新操作暂未实现')
        break
      case 'delete':
        // 分类删除操作需要在CloudApiService中实现
        console.warn('分类删除操作暂未实现')
        break
    }
  }

  /**
   * 执行账户操作
   */
  private static async executeAccountOperation(
    type: OfflineOperationType,
    entityId: string,
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        // 账户创建操作需要在CloudApiService中实现
        console.warn('账户创建操作暂未实现')
        break
      case 'update':
        await HybridDatabaseService.updateAccountBalance(entityId, data.amount, data.type, userId)
        break
      case 'delete':
        // 账户删除操作需要在CloudApiService中实现
        console.warn('账户删除操作暂未实现')
        break
    }
  }

  /**
   * 设置网络状态监听器
   */
  private static setupNetworkListeners(): void {
    // 监听在线状态变化
    window.addEventListener('online', async () => {
      console.log('网络已连接，开始处理离线队列')
      await this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      console.log('网络已断开，进入离线模式')
    })
  }

  /**
   * 从localStorage加载操作队列
   */
  private static async loadOperationQueue(): Promise<void> {
    try {
      const queueData = localStorage.getItem(this.OFFLINE_QUEUE_KEY)
      if (queueData) {
        this.operationQueue = JSON.parse(queueData)
        console.log(`已加载 ${this.operationQueue.length} 个离线操作`)
      }
    } catch (error) {
      console.error('加载离线操作队列失败:', error)
      this.operationQueue = []
    }
  }

  /**
   * 保存操作队列到localStorage
   */
  private static async saveOperationQueue(): Promise<void> {
    try {
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(this.operationQueue))
    } catch (error) {
      console.error('保存离线操作队列失败:', error)
    }
  }

  /**
   * 获取离线状态
   */
  static getOfflineStatus(): OfflineStatus {
    const pendingOperations = this.operationQueue.filter(op => !op.synced).length
    
    return {
      isOffline: !isOnline() || !isSupabaseConnected(),
      pendingOperations,
      lastSyncTime: HybridDatabaseService.getLastSyncTime(),
      queueSize: this.operationQueue.length
    }
  }

  /**
   * 清空操作队列
   */
  static async clearQueue(): Promise<void> {
    this.operationQueue = []
    await this.saveOperationQueue()
    console.log('离线操作队列已清空')
  }

  /**
   * 获取待处理操作数量
   */
  static getPendingOperationsCount(): number {
    return this.operationQueue.filter(op => !op.synced).length
  }

  /**
   * 获取操作队列
   */
  static getOperationQueue(): OfflineOperation[] {
    return [...this.operationQueue]
  }

  // ==================== 缓存管理 ====================

  /**
   * 设置缓存
   */
  static setCache(key: string, data: any, ttl?: number): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 0 // 0表示永不过期
      }
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  }

  /**
   * 获取缓存
   */
  static getCache<T>(key: string): T | null {
    try {
      const cacheStr = localStorage.getItem(this.CACHE_PREFIX + key)
      if (!cacheStr) return null

      const cacheData = JSON.parse(cacheStr)
      
      // 检查是否过期
      if (cacheData.ttl > 0 && Date.now() - cacheData.timestamp > cacheData.ttl) {
        this.removeCache(key)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  /**
   * 移除缓存
   */
  static removeCache(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key)
    } catch (error) {
      console.error('移除缓存失败:', error)
    }
  }

  /**
   * 清空所有缓存
   */
  static clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      console.log('所有缓存已清空')
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  }

  /**
   * 缓存用户数据
   */
  static cacheUserData(userId: string, data: {
    records?: Record[]
    categories?: Category[]
    accounts?: Account[]
  }): void {
    if (data.records) {
      this.setCache(`user_records_${userId}`, data.records, 5 * 60 * 1000) // 5分钟
    }
    if (data.categories) {
      this.setCache(`user_categories_${userId}`, data.categories, 10 * 60 * 1000) // 10分钟
    }
    if (data.accounts) {
      this.setCache(`user_accounts_${userId}`, data.accounts, 10 * 60 * 1000) // 10分钟
    }
  }

  /**
   * 获取缓存的用户数据
   */
  static getCachedUserData(userId: string): {
    records: Record[] | null
    categories: Category[] | null
    accounts: Account[] | null
  } {
    return {
      records: this.getCache<Record[]>(`user_records_${userId}`),
      categories: this.getCache<Category[]>(`user_categories_${userId}`),
      accounts: this.getCache<Account[]>(`user_accounts_${userId}`)
    }
  }

  /**
   * 销毁服务
   */
  static destroy(): void {
    this.operationQueue = []
    this.isProcessing = false
    
    // 移除事件监听器
    window.removeEventListener('online', this.processOfflineQueue)
    window.removeEventListener('offline', () => {})
  }
}

// 导出默认实例
export default OfflineService