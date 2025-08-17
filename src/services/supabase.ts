import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查环境变量是否配置
const isSupabaseConfigured = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseKey !== 'your-anon-key'

// 创建 Supabase 客户端（仅在配置正确时）
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// 导出配置状态
export const isSupabaseEnabled = isSupabaseConfigured

// 网络状态监听器
type NetworkStatusListener = (isOnline: boolean) => void
const networkListeners: NetworkStatusListener[] = []

// Supabase连接状态
let supabaseConnectionStatus = true
let lastConnectionCheck = 0
const CONNECTION_CHECK_INTERVAL = 30000 // 30秒

/**
 * 网络状态检测
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * 检查Supabase连接状态
 */
export async function isSupabaseConnected(): Promise<boolean> {
  const now = Date.now()
  
  // 如果最近检查过，直接返回缓存结果
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return supabaseConnectionStatus
  }

  try {
    // 使用轻量级查询检查连接
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()
    
    supabaseConnectionStatus = !error || error.code === 'PGRST116' // PGRST116表示没有数据，但连接正常
    lastConnectionCheck = now
    
    return supabaseConnectionStatus
  } catch (error) {
    console.warn('Supabase连接检查失败:', error)
    supabaseConnectionStatus = false
    lastConnectionCheck = now
    return false
  }
}

/**
 * 强制检查Supabase连接状态
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  lastConnectionCheck = 0 // 重置缓存
  return await isSupabaseConnected()
}

/**
 * 添加网络状态监听器
 */
export function addNetworkStatusListener(listener: NetworkStatusListener): () => void {
  networkListeners.push(listener)
  
  // 返回取消监听的函数
  return () => {
    const index = networkListeners.indexOf(listener)
    if (index > -1) {
      networkListeners.splice(index, 1)
    }
  }
}

/**
 * 通知网络状态变化
 */
function notifyNetworkStatusChange(isOnline: boolean): void {
  networkListeners.forEach(listener => {
    try {
      listener(isOnline)
    } catch (error) {
      console.error('网络状态监听器执行失败:', error)
    }
  })
}

/**
 * 初始化网络状态监听
 */
export function initializeNetworkMonitoring(): void {
  // 监听浏览器网络状态变化
  window.addEventListener('online', () => {
    console.log('网络已连接')
    notifyNetworkStatusChange(true)
    // 网络恢复时重新检查Supabase连接
    checkSupabaseConnection()
  })

  window.addEventListener('offline', () => {
    console.log('网络已断开')
    supabaseConnectionStatus = false
    notifyNetworkStatusChange(false)
  })

  // 定期检查Supabase连接状态
  setInterval(async () => {
    if (isOnline()) {
      await checkSupabaseConnection()
    }
  }, CONNECTION_CHECK_INTERVAL)
}

// 错误类型枚举
export enum SupabaseErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// 错误信息接口
export interface SupabaseErrorInfo {
  type: SupabaseErrorType
  message: string
  originalError: any
  retryable: boolean
}

/**
 * Supabase错误处理工具
 */
export function handleSupabaseError(error: any): SupabaseErrorInfo {
  if (!error) {
    return {
      type: SupabaseErrorType.UNKNOWN,
      message: '未知错误',
      originalError: error,
      retryable: false
    }
  }
  
  const errorMessage = error.message || error.toString() || ''
  
  // 网络错误
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return {
      type: SupabaseErrorType.NETWORK,
      message: '网络连接失败，请检查网络设置',
      originalError: error,
      retryable: true
    }
  }
  
  // 认证错误
  if (errorMessage.includes('JWT') || errorMessage.includes('auth') || errorMessage.includes('token')) {
    return {
      type: SupabaseErrorType.AUTH,
      message: '认证失败，请重新登录',
      originalError: error,
      retryable: false
    }
  }
  
  // 权限错误
  if (errorMessage.includes('permission') || errorMessage.includes('policy') || errorMessage.includes('unauthorized')) {
    return {
      type: SupabaseErrorType.PERMISSION,
      message: '权限不足，无法执行此操作',
      originalError: error,
      retryable: false
    }
  }
  
  // 速率限制错误
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      type: SupabaseErrorType.RATE_LIMIT,
      message: '请求过于频繁，请稍后再试',
      originalError: error,
      retryable: true
    }
  }
  
  // 数据验证错误
  if (errorMessage.includes('violates') || errorMessage.includes('constraint') || errorMessage.includes('invalid')) {
    return {
      type: SupabaseErrorType.VALIDATION,
      message: '数据格式错误，请检查输入内容',
      originalError: error,
      retryable: false
    }
  }
  
  // 服务器错误
  if (errorMessage.includes('500') || errorMessage.includes('server') || errorMessage.includes('internal')) {
    return {
      type: SupabaseErrorType.SERVER,
      message: '服务器错误，请稍后再试',
      originalError: error,
      retryable: true
    }
  }
  
  return {
    type: SupabaseErrorType.UNKNOWN,
    message: errorMessage || '操作失败',
    originalError: error,
    retryable: false
  }
}

/**
 * 重试机制
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const errorInfo = handleSupabaseError(error)
      
      // 如果错误不可重试，直接抛出
      if (!errorInfo.retryable) {
        throw error
      }
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw error
      }
      
      // 等待后重试
      console.warn(`操作失败，${delay}ms后进行第${attempt + 1}次重试:`, errorInfo.message)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

/**
 * 获取网络状态信息
 */
export function getNetworkStatus() {
  return {
    isOnline: isOnline(),
    isSupabaseConnected: supabaseConnectionStatus,
    lastConnectionCheck: new Date(lastConnectionCheck),
    connectionType: (navigator as any).connection?.effectiveType || 'unknown'
  }
}

// 数据同步状态
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// 同步结果接口
export interface SyncResult {
  status: SyncStatus
  message?: string
  timestamp: Date
  uploadCount?: number
  downloadCount?: number
  conflictCount?: number
  errors?: string[]
}

// 连接状态监听器
type ConnectionStatusListener = (status: {
  isOnline: boolean
  isSupabaseConnected: boolean
}) => void

const connectionListeners: ConnectionStatusListener[] = []

/**
 * 添加连接状态监听器
 */
export function addConnectionStatusListener(listener: ConnectionStatusListener): () => void {
  connectionListeners.push(listener)
  
  // 返回取消监听的函数
  return () => {
    const index = connectionListeners.indexOf(listener)
    if (index > -1) {
      connectionListeners.splice(index, 1)
    }
  }
}

/**
 * 通知连接状态变化
 */
function notifyConnectionStatusChange(): void {
  const status = {
    isOnline: isOnline(),
    isSupabaseConnected: supabaseConnectionStatus
  }
  
  connectionListeners.forEach(listener => {
    try {
      listener(status)
    } catch (error) {
      console.error('连接状态监听器执行失败:', error)
    }
  })
}

// 在网络状态变化时通知连接状态监听器
addNetworkStatusListener(() => {
  notifyConnectionStatusChange()
})