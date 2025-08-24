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
  expires_in: string
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
      body: JSON.stringify({ identifier: email, password, username }),
    })
    
    if (response.token) {
      ApiClient.setToken(response.token)
    }
    
    return response
  }

  static async signIn(identifier: string, password: string): Promise<AuthResponse> {
    const response = await ApiClient.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
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

  // 请求密码重置
  static async requestPasswordReset(email: string): Promise<void> {
    return ApiClient.request<void>('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // 重置密码
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    return ApiClient.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    })
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
    const backendRecords = await ApiClient.request<any[]>(endpoint)
    
    // 确保backendRecords是数组
    if (!Array.isArray(backendRecords)) {
      console.error('Backend returned non-array data:', backendRecords)
      return []
    }
    
    // 转换后端字段名到前端字段名
    return backendRecords.map(record => ({
      id: record.id,
      type: record.type,
      amount: record.amount,
      categoryId: record.category_id,
      accountId: record.account_id,
      note: record.description || '',
      date: record.date,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }))
  }

  static async createRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>): Promise<Record> {
    // 转换字段名以匹配后端API期望的格式
    const backendRecord = {
      amount: record.amount,
      type: record.type,
      category_id: record.categoryId,
      account_id: record.accountId,
      description: record.note || '',
      date: record.date
    }
    
    const backendResponse = await ApiClient.request<any>('/records', {
      method: 'POST',
      body: JSON.stringify(backendRecord),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      type: backendResponse.type,
      amount: backendResponse.amount,
      categoryId: backendResponse.category_id,
      accountId: backendResponse.account_id,
      note: backendResponse.description || '',
      date: backendResponse.date,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async updateRecord(id: string, record: Partial<Record>): Promise<Record> {
    // 转换字段名以匹配后端API期望的格式
    const backendRecord: any = {}
    if (record.amount !== undefined) backendRecord.amount = record.amount
    if (record.type !== undefined) backendRecord.type = record.type
    if (record.categoryId !== undefined) backendRecord.category_id = record.categoryId
    if (record.accountId !== undefined) backendRecord.account_id = record.accountId
    if (record.note !== undefined) backendRecord.description = record.note
    if (record.date !== undefined) backendRecord.date = record.date
    
    const backendResponse = await ApiClient.request<any>(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendRecord),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      type: backendResponse.type,
      amount: backendResponse.amount,
      categoryId: backendResponse.category_id,
      accountId: backendResponse.account_id,
      note: backendResponse.description || '',
      date: backendResponse.date,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async deleteRecord(id: string): Promise<void> {
    return ApiClient.request<void>(`/records/${id}`, {
      method: 'DELETE',
    })
  }

  // 分类相关
  static async getCategories(): Promise<Category[]> {
    const backendCategories = await ApiClient.request<any[]>('/categories')
    
    // 转换后端字段名到前端字段名
    return backendCategories.map(category => ({
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon || '',
      color: category.color || '',
      isDefault: false, // 后端没有这个字段，设为默认值
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }))
  }

  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    // 转换字段名以匹配后端API期望的格式
    const backendCategory = {
      name: category.name,
      type: category.type,
      icon: category.icon || '',
      color: category.color || ''
    }
    
    const backendResponse = await ApiClient.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(backendCategory),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      name: backendResponse.name,
      type: backendResponse.type,
      icon: backendResponse.icon || '',
      color: backendResponse.color || '',
      isDefault: false,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    // 转换字段名以匹配后端API期望的格式
    const backendCategory: any = {}
    if (category.name !== undefined) backendCategory.name = category.name
    if (category.type !== undefined) backendCategory.type = category.type
    if (category.icon !== undefined) backendCategory.icon = category.icon
    if (category.color !== undefined) backendCategory.color = category.color
    
    const backendResponse = await ApiClient.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendCategory),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      name: backendResponse.name,
      type: backendResponse.type,
      icon: backendResponse.icon || '',
      color: backendResponse.color || '',
      isDefault: false,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    return ApiClient.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // 账户相关
  static async getAccounts(): Promise<Account[]> {
    const backendAccounts = await ApiClient.request<any[]>('/accounts')
    
    // 转换后端字段名到前端字段名
    return backendAccounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      createdAt: account.created_at,
      updatedAt: account.updated_at
    }))
  }

  static async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    // 转换字段名以匹配后端API期望的格式
    const backendAccount = {
      name: account.name,
      type: account.type,
      balance: account.balance
    }
    
    const backendResponse = await ApiClient.request<any>('/accounts', {
      method: 'POST',
      body: JSON.stringify(backendAccount),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      name: backendResponse.name,
      type: backendResponse.type,
      balance: backendResponse.balance,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async updateAccount(id: string, account: Partial<Account>): Promise<Account> {
    // 转换字段名以匹配后端API期望的格式
    const backendAccount: any = {}
    if (account.name !== undefined) backendAccount.name = account.name
    if (account.type !== undefined) backendAccount.type = account.type
    if (account.balance !== undefined) backendAccount.balance = account.balance
    
    const backendResponse = await ApiClient.request<any>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendAccount),
    })
    
    // 转换后端字段名到前端字段名
    return {
      id: backendResponse.id,
      name: backendResponse.name,
      type: backendResponse.type,
      balance: backendResponse.balance,
      createdAt: backendResponse.created_at,
      updatedAt: backendResponse.updated_at
    }
  }

  static async deleteAccount(id: string): Promise<void> {
    return ApiClient.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  // 统计相关
  static async getMonthlyStatistics(year: number, month: number): Promise<any> {
    const params = new URLSearchParams()
    params.append('year', year.toString())
    params.append('month', month.toString())
    
    const backendStats = await ApiClient.request<any>(`/statistics/monthly?${params.toString()}`)
    
    // 转换后端字段名到前端字段名
    return {
      year: backendStats.year || year,
      month: backendStats.month || month,
      totalIncome: backendStats.totalIncome || 0,
      totalExpense: backendStats.totalExpense || 0,
      incomeCount: backendStats.incomeCount || 0,
      expenseCount: backendStats.expenseCount || 0,
      balance: backendStats.balance || (backendStats.totalIncome || 0) - (backendStats.totalExpense || 0)
    }
  }

  static async getCategoryStatistics(startDate: Date, endDate: Date, type: 'income' | 'expense' = 'expense'): Promise<any[]> {
    const params = new URLSearchParams()
    params.append('startDate', startDate.toISOString().split('T')[0])
    params.append('endDate', endDate.toISOString().split('T')[0])
    params.append('type', type)
    
    const backendStats = await ApiClient.request<any[]>(`/statistics/category?${params.toString()}`)
    
    // 转换后端字段名到前端字段名
    return backendStats.map(stat => ({
      categoryId: stat.category_id,
      type: type, // 添加type字段，使用请求参数中的type
      categoryName: stat.category_name,
      amount: stat.amount,
      count: stat.count,
      percentage: stat.percentage || 0,
      icon: stat.icon || '',
      color: stat.color || ''
    }))
  }

  static async getAccountStatistics(startDate: Date, endDate: Date): Promise<any[]> {
    const params = new URLSearchParams()
    params.append('startDate', startDate.toISOString().split('T')[0])
    params.append('endDate', endDate.toISOString().split('T')[0])
    
    const backendStats = await ApiClient.request<any[]>(`/statistics/account?${params.toString()}`)
    
    // 转换后端字段名到前端字段名
    return backendStats.map(stat => ({
      accountId: stat.account_id,
      accountName: stat.account_name,
      accountType: stat.account_type,
      income: stat.income,
      expense: stat.expense,
      balance: stat.balance,
      count: stat.count
    }))
  }

  // 健康检查
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return ApiClient.request<{ status: string; timestamp: string }>('/health')
  }

  // 导出数据
  static async exportData(): Promise<string> {
    const response = await ApiClient.request<any>('/export/data')
    return JSON.stringify(response, null, 2)
  }

  static async importData(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = ApiClient.getToken()
    const response = await fetch(`${API_BASE_URL}/import/data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Import failed')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error?.message || 'Import failed')
    }

    return result.data
  }
}

// 导出API客户端工具
export { ApiClient }