import { supabase, isSupabaseEnabled } from './supabase'
import { User } from '../types'
import { HybridDatabaseService } from './hybridDatabase'

// 认证状态
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// 登录凭据
export interface LoginCredentials {
  email: string
  password: string
}

// 注册数据
export interface RegisterData {
  email: string
  password: string
  username: string
}

/**
 * 认证服务类
 * 集成Supabase用户认证和本地用户管理
 */
export class AuthService {
  private static currentUser: User | null = null
  private static authListeners: ((user: User | null) => void)[] = []

  /**
   * 初始化认证服务
   */
  static async initialize(): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      console.warn('Supabase未配置，认证服务将在离线模式下运行')
      return
    }

    // 监听Supabase认证状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleSignIn(session.user)
      } else if (event === 'SIGNED_OUT') {
        await this.handleSignOut()
      }
    })

    // 检查当前会话
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await this.handleSignIn(session.user)
    }
  }

  /**
   * 用户注册
   */
  static async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return { user: null, error: '云端认证服务未配置，请联系管理员' }
    }

    try {
      // 1. 在Supabase中注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username
          }
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: '注册失败' }
      }

      // 2. 创建本地用户记录
      const user: User = {
        id: authData.user.id,
        username: data.username,
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 3. 初始化用户默认数据
      await HybridDatabaseService.ensureUserDefaultData(user.id)

      this.currentUser = user
      this.notifyAuthListeners(user)

      return { user, error: null }
    } catch (error) {
      console.error('注册失败:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : '注册失败'
      }
    }
  }

  /**
   * 用户登录
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return { user: null, error: '云端认证服务未配置，请联系管理员' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: '登录失败' }
      }

      // 登录成功会触发onAuthStateChange，在那里处理用户状态
      return { user: this.currentUser, error: null }
    } catch (error) {
      console.error('登录失败:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : '登录失败'
      }
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<{ error: string | null }> {
    if (!isSupabaseEnabled || !supabase) {
      // 如果没有Supabase，直接清理本地状态
      await this.handleSignOut()
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      // 登出成功会触发onAuthStateChange，在那里处理用户状态
      return { error: null }
    } catch (error) {
      console.error('登出失败:', error)
      return {
        error: error instanceof Error ? error.message : '登出失败'
      }
    }
  }

  /**
   * 获取当前用户
   */
  static getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * 检查是否已认证
   */
  static isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * 重置密码
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseEnabled || !supabase) {
      return { error: '云端认证服务未配置，无法重置密码' }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('重置密码失败:', error)
      return {
        error: error instanceof Error ? error.message : '重置密码失败'
      }
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(updates: Partial<Pick<User, 'username'>>): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { user: null, error: '用户未登录' }
      }

      // 如果Supabase可用，更新用户元数据
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            username: updates.username
          }
        })

        if (error) {
          return { user: null, error: error.message }
        }
      }

      // 更新本地用户信息
      const updatedUser: User = {
        ...this.currentUser,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      this.currentUser = updatedUser
      this.notifyAuthListeners(updatedUser)

      return { user: updatedUser, error: null }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : '更新失败'
      }
    }
  }

  /**
   * 添加认证状态监听器
   */
  static addAuthListener(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this.authListeners.indexOf(listener)
      if (index > -1) {
        this.authListeners.splice(index, 1)
      }
    }
  }

  /**
   * 处理登录
   */
  private static async handleSignIn(supabaseUser: any): Promise<void> {
    try {
      const user: User = {
        id: supabaseUser.id,
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        createdAt: supabaseUser.created_at,
        updatedAt: new Date().toISOString()
      }

      this.currentUser = user
      this.notifyAuthListeners(user)

      // 确保用户有默认数据
      await HybridDatabaseService.ensureUserDefaultData(user.id)

      // 触发数据同步
      try {
        await HybridDatabaseService.syncData(user.id)
      } catch (error) {
        console.warn('登录后同步数据失败:', error)
      }
    } catch (error) {
      console.error('处理登录失败:', error)
    }
  }

  /**
   * 处理登出
   */
  private static async handleSignOut(): Promise<void> {
    this.currentUser = null
    this.notifyAuthListeners(null)
  }

  /**
   * 通知认证状态监听器
   */
  private static notifyAuthListeners(user: User | null): void {
    this.authListeners.forEach(listener => {
      try {
        listener(user)
      } catch (error) {
        console.error('认证监听器执行失败:', error)
      }
    })
  }

  /**
   * 获取认证状态
   */
  static getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
      isLoading: false,
      error: null
    }
  }

  /**
   * 清理服务
   */
  static destroy(): void {
    this.currentUser = null
    this.authListeners = []
  }
}

// 导出默认实例
export default AuthService