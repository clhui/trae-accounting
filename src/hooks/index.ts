import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRecordStore, useSettingsStore } from '../stores/recordStore'
import { debounce, throttle } from '../utils'
import type { Record, Category, Account, QueryParams, MonthlyStats, CategoryStats } from '../types'

// 记录管理 Hook
export function useRecords(params?: QueryParams) {
  const recordStore = useRecordStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadRecords = async (queryParams?: QueryParams) => {
    loading.value = true
    error.value = null
    try {
      await recordStore.loadRecords({ ...params, ...queryParams })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载记录失败'
    } finally {
      loading.value = false
    }
  }

  const addRecord = async (record: Omit<Record, 'id'>) => {
    try {
      await recordStore.addRecord(record)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加记录失败'
      return false
    }
  }

  const updateRecord = async (id: string, record: Partial<Record>) => {
    try {
      await recordStore.updateRecord(id, record)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新记录失败'
      return false
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      await recordStore.deleteRecord(id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除记录失败'
      return false
    }
  }

  onMounted(() => {
    loadRecords()
  })

  return {
    records: computed(() => recordStore.records),
    loading,
    error,
    loadRecords,
    addRecord,
    updateRecord,
    deleteRecord
  }
}

// 分类管理 Hook
export function useCategories(type?: 'income' | 'expense') {
  const recordStore = useRecordStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const categories = computed(() => {
    if (type) {
      return recordStore.categories.filter(c => c.type === type)
    }
    return recordStore.categories
  })

  const loadCategories = async () => {
    loading.value = true
    error.value = null
    try {
      await recordStore.loadCategories()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类失败'
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await recordStore.addCategory(category)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加分类失败'
      return false
    }
  }

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      await recordStore.updateCategory(id, category)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新分类失败'
      return false
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await recordStore.deleteCategory(id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除分类失败'
      return false
    }
  }

  onMounted(() => {
    loadCategories()
  })

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory
  }
}

// 账户管理 Hook
export function useAccounts() {
  const recordStore = useRecordStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadAccounts = async () => {
    loading.value = true
    error.value = null
    try {
      await recordStore.loadAccounts()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载账户失败'
    } finally {
      loading.value = false
    }
  }

  const addAccount = async (account: Omit<Account, 'id'>) => {
    try {
      await recordStore.addAccount(account)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加账户失败'
      return false
    }
  }

  const updateAccount = async (id: string, account: Partial<Account>) => {
    try {
      await recordStore.updateAccount(id, account)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新账户失败'
      return false
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      await recordStore.deleteAccount(id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除账户失败'
      return false
    }
  }

  onMounted(() => {
    loadAccounts()
  })

  return {
    accounts: computed(() => recordStore.accounts),
    loading,
    error,
    loadAccounts,
    addAccount,
    updateAccount,
    deleteAccount
  }
}

// 统计数据 Hook
export function useStats(year?: number, month?: number) {
  const recordStore = useRecordStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadMonthlyStats = async (y?: number, m?: number) => {
    loading.value = true
    error.value = null
    try {
      const currentYear = y || year || new Date().getFullYear()
      const currentMonth = m || month || new Date().getMonth() + 1
      await recordStore.loadMonthlyStats(currentYear, currentMonth)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载统计数据失败'
    } finally {
      loading.value = false
    }
  }

  const loadCategoryStats = async (y?: number, m?: number, type?: 'income' | 'expense') => {
    loading.value = true
    error.value = null
    try {
      const currentYear = y || year || new Date().getFullYear()
      const currentMonth = m || month || new Date().getMonth() + 1
      await recordStore.loadCategoryStats(currentYear, currentMonth, type)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类统计失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadMonthlyStats()
  })

  return {
    monthlyStats: computed(() => recordStore.monthlyStats),
    categoryStats: computed(() => recordStore.categoryStats),
    loading,
    error,
    loadMonthlyStats,
    loadCategoryStats
  }
}

// 防抖搜索 Hook
export function useDebounceSearch(callback: (query: string) => void, delay: number = 300) {
  const searchQuery = ref('')
  const debouncedCallback = debounce(callback, delay)

  watch(searchQuery, (newQuery) => {
    debouncedCallback(newQuery)
  })

  return {
    searchQuery,
    setSearchQuery: (query: string) => {
      searchQuery.value = query
    }
  }
}

// 本地存储 Hook
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = ref<T>(defaultValue)

  // 从本地存储读取初始值
  const loadFromStorage = () => {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
  }

  // 保存到本地存储
  const saveToStorage = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      storedValue.value = value
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  // 从本地存储删除
  const removeFromStorage = () => {
    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }

  onMounted(() => {
    loadFromStorage()
  })

  // 监听值变化，自动保存
  watch(storedValue, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  return {
    value: storedValue,
    setValue: saveToStorage,
    removeValue: removeFromStorage
  }
}

// 异步操作 Hook
export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)

  const execute = async (...args: P) => {
    loading.value = true
    error.value = null
    try {
      const result = await asyncFunction(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '操作失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

// 表单验证 Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const values = ref<T>({ ...initialValues })
  const errors = ref<Partial<Record<keyof T, string>>>({})
  const touched = ref<Partial<Record<keyof T, boolean>>>({})

  const validate = (field?: keyof T) => {
    if (field) {
      const rule = validationRules[field]
      if (rule) {
        const error = rule(values.value[field])
        if (error) {
          errors.value[field] = error
        } else {
          delete errors.value[field]
        }
      }
    } else {
      // 验证所有字段
      Object.keys(validationRules).forEach(key => {
        validate(key as keyof T)
      })
    }
  }

  const setValue = (field: keyof T, value: any) => {
    values.value[field] = value
    touched.value[field] = true
    validate(field)
  }

  const setValues = (newValues: Partial<T>) => {
    Object.assign(values.value, newValues)
    Object.keys(newValues).forEach(key => {
      touched.value[key as keyof T] = true
    })
    validate()
  }

  const reset = () => {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
  }

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues,
    validate,
    reset
  }
}

// 无限滚动 Hook
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: {
    threshold?: number
    disabled?: boolean
  } = {}
) {
  const { threshold = 100, disabled = false } = options
  const loading = ref(false)

  const handleScroll = throttle(async () => {
    if (disabled || loading.value) return

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loading.value = true
      try {
        await callback()
      } finally {
        loading.value = false
      }
    }
  }, 200)

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    loading
  }
}

// 点击外部区域 Hook
export function useClickOutside(
  elementRef: any,
  callback: () => void
) {
  const handleClick = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}

// 键盘快捷键 Hook
export function useKeyboard(
  shortcuts: Record<string, () => void>
) {
  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    const modifiers = []
    
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.altKey) modifiers.push('alt')
    if (event.shiftKey) modifiers.push('shift')
    if (event.metaKey) modifiers.push('meta')
    
    const shortcut = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
    
    if (shortcuts[shortcut]) {
      event.preventDefault()
      shortcuts[shortcut]()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

// 网络状态 Hook
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)

  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline
  }
}

// 设置管理 Hook
export function useSettings() {
  const settingsStore = useSettingsStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadSettings = async () => {
    loading.value = true
    error.value = null
    try {
      await settingsStore.loadSettings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载设置失败'
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (settings: Partial<typeof settingsStore.settings>) => {
    try {
      await settingsStore.updateSettings(settings)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新设置失败'
      return false
    }
  }

  onMounted(() => {
    loadSettings()
  })

  return {
    settings: computed(() => settingsStore.settings),
    loading,
    error,
    loadSettings,
    updateSettings
  }
}