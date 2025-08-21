import type { Record, Category, Account, User } from '../types'

// 后端API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'

// API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    status: number
  }
}

// 认证相关类型
interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// 请求工具函数
class ApiClient {
  private static token: string | null = null

  static setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  static clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'API request failed')
      }

      return data.data as T
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
}

// 后端API服务
export class BackendApiService {
  // 认证相关
  static async signUp(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await ApiClient.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })
    
    if (response.token) {
      ApiClient.setToken(response.token)
    }
    
    return response
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await ApiClient.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.token) {
      ApiClient.setToken(response.token)
    }
    
    return response
  }

  static async signOut(): Promise<void> {
    ApiClient.clearToken()
  }

  static async refreshToken(): Promise<AuthResponse> {
    const response = await ApiClient.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    })
    
    if (response.token) {
      ApiClient.setToken(response.token)
    }
    
    return response
  }

  static async getProfile(): Promise<User> {
    return ApiClient.request<User>('/auth/profile')
  }

  // 记录相关
  static async getRecords(filters?: {
    type?: 'income' | 'expense'
    categoryId?: string
    accountId?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<Record[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const endpoint = `/records${params.toString() ? `?${params.toString()}` : ''}`
    return ApiClient.request<Record[]>(endpoint)
  }

  static async createRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>): Promise<Record> {
    return ApiClient.request<Record>('/records', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  static async updateRecord(id: string, record: Partial<Record>): Promise<Record> {
    return ApiClient.request<Record>(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    })
  }

  static async deleteRecord(id: string): Promise<void> {
    return ApiClient.request<void>(`/records/${id}`, {
      method: 'DELETE',
    })
  }

  // 分类相关
  static async getCategories(): Promise<Category[]> {
    return ApiClient.request<Category[]>('/categories')
  }

  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return ApiClient.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    return ApiClient.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    })
  }

  static async deleteCategory(id: string): Promise<void> {
    return ApiClient.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // 账户相关
  static async getAccounts(): Promise<Account[]> {
    return ApiClient.request<Account[]>('/accounts')
  }

  static async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return ApiClient.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    })
  }

  static async updateAccount(id: string, account: Partial<Account>): Promise<Account> {
    return ApiClient.request<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    })
  }

  static async deleteAccount(id: string): Promise<void> {
    return ApiClient.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  // 健康检查
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return ApiClient.request<{ status: string; timestamp: string }>('/health')
  }
}

// 导出API客户端工具
export { ApiClient }