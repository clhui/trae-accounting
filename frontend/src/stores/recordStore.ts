import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Record, Category, Account, RecordFilters, MonthlyStats, CategoryStats, AccountStats } from '../types'
import { BackendApiService } from '../services/backendApi'
import { useAuthStore } from './authStore'

export const useRecordStore = defineStore('record', () => {
  const authStore = useAuthStore()
  // 状态
  const records = ref<Record[]>([])
  const categories = ref<Category[]>([])
  const accounts = ref<Account[]>([])
  const monthlyStats = ref<MonthlyStats | null>(null)
  const categoryStats = ref<CategoryStats[]>([])
  const accountStats = ref<AccountStats[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const incomeCategories = computed(() => 
    categories.value.filter(cat => cat.type === 'income')
  )
  
  const expenseCategories = computed(() => 
    categories.value.filter(cat => cat.type === 'expense')
  )

  const totalBalance = computed(() => 
    accounts.value.reduce((sum, account) => sum + account.balance, 0)
  )

  // 记录操作
  const addRecord = async (recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const newRecord = await BackendApiService.createRecord(recordData)
      records.value.unshift(newRecord)
      
      await loadAccounts()
      
      // 如果当前显示的是本月统计，重新加载
      const now = new Date()
      if (monthlyStats.value?.year === now.getFullYear() && 
          monthlyStats.value?.month === now.getMonth() + 1) {
        await loadMonthlyStats(now.getFullYear(), now.getMonth() + 1)
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRecord = async (id: string, updates: Partial<Record>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.updateRecord(id, updates)
      
      // 更新本地状态
      const index = records.value.findIndex(record => record.id === id)
      if (index !== -1) {
        records.value[index] = { ...records.value[index], ...updates, updatedAt: new Date().toISOString() }
      }
      
      await loadAccounts()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRecord = async (id: string) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.deleteRecord(id)
      
      // 更新本地状态
      records.value = records.value.filter(record => record.id !== id)
      
      await loadAccounts()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadRecords = async (filters?: RecordFilters) => {
    if (!authStore.user) {
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const data = await BackendApiService.getRecords(filters)
      records.value = data
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载记录失败'
    } finally {
      loading.value = false
    }
  }

  // 分类操作
  const loadCategories = async (type?: 'income' | 'expense') => {
    if (!authStore.user) {
      return
    }
    
    try {
      const data = await BackendApiService.getCategories()
      // 如果指定了类型，则过滤数据
      if (type) {
        categories.value = data.filter(cat => cat.type === type)
      } else {
        categories.value = data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类失败'
    }
  }

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.createCategory(categoryData)
      await loadCategories()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id'>>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.updateCategory(id, categoryData)
      await loadCategories()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.deleteCategory(id)
      await loadCategories()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 账户操作
  const loadAccounts = async () => {
    if (!authStore.user) {
      return
    }
    
    try {
      const data = await BackendApiService.getAccounts()
      accounts.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载账户失败'
    }
  }

  const addAccount = async (accountData: Omit<Account, 'id'>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.createAccount(accountData)
      await loadAccounts()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加账户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (id: string, accountData: Partial<Omit<Account, 'id'>>) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.updateAccount(id, accountData)
      await loadAccounts()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新账户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (id: string) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.deleteAccount(id)
      await loadAccounts()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除账户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 统计操作
  const loadMonthlyStats = async (year: number, month: number) => {
    if (!authStore.user) {
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const data = await BackendApiService.getMonthlyStatistics(year, month)
      monthlyStats.value = data
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载月度统计失败'
    } finally {
      loading.value = false
    }
  }

  const loadCategoryStats = async (startDate: Date, endDate: Date, type: 'income' | 'expense' = 'expense') => {
    if (!authStore.user) {
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const data = await BackendApiService.getCategoryStatistics(startDate, endDate, type)
      categoryStats.value = data
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类统计失败'
    } finally {
      loading.value = false
    }
  }

  const loadAccountStats = async (startDate: Date, endDate: Date) => {
    if (!authStore.user) {
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      const data = await BackendApiService.getAccountStatistics(startDate, endDate)
      accountStats.value = data
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载账户统计失败'
    } finally {
      loading.value = false
    }
  }

  // 数据管理
  const exportData = async (): Promise<string> => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const data = await BackendApiService.exportData()
      return data
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导出数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const importData = async (file: File) => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const result = await BackendApiService.importData(file)
      
      // 重新加载所有数据
      await Promise.all([
        loadRecords({ limit: 10 }),
        loadCategories(),
        loadAccounts()
      ])
      
      return result
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导入数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearUserData = async () => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.clearUserData()
      
      // 清空本地状态
      records.value = []
      categories.value = []
      accounts.value = []
      monthlyStats.value = null
      categoryStats.value = []
      
      // 重新加载默认数据
      await Promise.all([
        loadCategories(),
        loadAccounts()
      ])
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清空数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetUserDatabase = async () => {
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await BackendApiService.resetUserDatabase()
      
      // 重新加载所有数据
      await Promise.all([
        loadRecords({ limit: 10 }),
        loadCategories(),
        loadAccounts()
      ])
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 工具方法
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (value: string | null) => {
    error.value = value
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    records,
    categories,
    accounts,
    monthlyStats,
    categoryStats,
    accountStats,
    loading,
    error,
    
    // 计算属性
    incomeCategories,
    expenseCategories,
    totalBalance,
    
    // 方法
    addRecord,
    updateRecord,
    deleteRecord,
    loadRecords,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loadAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    loadMonthlyStats,
    loadCategoryStats,
    loadAccountStats,
    exportData,
    importData,
    clearUserData,
    resetUserDatabase,
    setLoading,
    setError,
    clearError
  }
})

// 设置状态管理
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const currency = ref('¥')
  const language = ref('zh-CN')
  const autoBackup = ref(true)
  const budgetAlert = ref(true)

  const updateSettings = (newSettings: Partial<{
    theme: 'light' | 'dark' | 'auto'
    currency: string
    language: string
    autoBackup: boolean
    budgetAlert: boolean
  }>) => {
    if (newSettings.theme !== undefined) {
      theme.value = newSettings.theme
      applyTheme(newSettings.theme)
    }
    if (newSettings.currency !== undefined) currency.value = newSettings.currency
    if (newSettings.language !== undefined) language.value = newSettings.language
    if (newSettings.autoBackup !== undefined) autoBackup.value = newSettings.autoBackup
    if (newSettings.budgetAlert !== undefined) budgetAlert.value = newSettings.budgetAlert
    
    saveSettings()
  }

  const applyTheme = (themeValue: 'light' | 'dark' | 'auto') => {
    const html = document.documentElement
    
    if (themeValue === 'auto') {
      // 跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      html.setAttribute('data-theme', themeValue)
    }
  }

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('accounting-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        theme.value = settings.theme || 'auto'
        currency.value = settings.currency || '¥'
        language.value = settings.language || 'zh-CN'
        autoBackup.value = settings.autoBackup ?? true
        budgetAlert.value = settings.budgetAlert ?? true
      }
      
      // 应用主题
      applyTheme(theme.value)
      
      // 监听系统主题变化
      if (theme.value === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
          if (theme.value === 'auto') {
            applyTheme('auto')
          }
        })
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  const saveSettings = () => {
    try {
      const settings = {
        theme: theme.value,
        currency: currency.value,
        language: language.value,
        autoBackup: autoBackup.value,
        budgetAlert: budgetAlert.value
      }
      localStorage.setItem('accounting-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  return {
    theme,
    currency,
    language,
    autoBackup,
    budgetAlert,
    updateSettings,
    loadSettings,
    saveSettings
  }
})