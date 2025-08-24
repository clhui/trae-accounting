import { BackendApiService } from './backendApi'
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
    try {
      // 检查本地存储的token
      const token = localStorage.getItem('auth_token')
      if (token) {
        // 验证token并获取用户信息
        const response = await BackendApiService.getProfile()
        await this.handleSignIn(response.user)
      }
    } catch (error) {
      console.warn('初始化认证服务失败，清除本地认证信息:', error)
      // 清除无效的本地认证信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }

  /**
   * 用户注册
   */
  static async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      // 1. 调用后端API注册用户
      const response = await BackendApiService.signUp({
        email: data.email,
        password: data.password,
        username: data.username
      })

      // 2. 存储认证信息到本地
      localStorage.setItem('auth_token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(response.user))

      // 3. 初始化用户默认数据
      await HybridDatabaseService.ensureUserDefaultData(response.user.id)

      this.currentUser = response.user
      this.notifyAuthListeners(response.user)

      return { user: response.user, error: null }
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
    try {
      // 1. 调用后端API登录
      const response = await BackendApiService.signIn({
        email: credentials.email,
        password: credentials.password
      })

      // 2. 存储认证信息到本地
      localStorage.setItem('auth_token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(response.user))

      // 3. 处理登录状态
      await this.handleSignIn(response.user)

      return { user: response.user, error: null }
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
    try {
      // 1. 调用后端API登出
      await BackendApiService.signOut()
      
      // 2. 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      // 3. 处理登出状态
      await this.handleSignOut()

      return { error: null }
    } catch (error) {
      console.error('登出失败:', error)
      // 即使后端登出失败，也要清除本地状态
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      await this.handleSignOut()
      
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
  /**
   * 请求密码重置
   */
  static async requestPasswordReset(email: string): Promise<{ error: string | null }> {
    try {
      await BackendApiService.requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      console.error('请求密码重置失败:', error)
      return {
        error: error instanceof Error ? error.message : '请求密码重置失败'
      }
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ error: string | null }> {
    try {
      await BackendApiService.resetPassword(token, newPassword)
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

      // 调用后端API更新用户信息
      const response = await BackendApiService.updateProfile(updates)

      // 更新本地用户信息
      const updatedUser: User = {
        ...this.currentUser,
        ...response.user,
        updatedAt: new Date().toISOString()
      }

      this.currentUser = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
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
  private static async handleSignIn(user: User): Promise<void> {
    try {
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