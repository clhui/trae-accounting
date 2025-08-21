import type { Category } from '../types'

// 格式化金额
export const formatAmount = (amount: number, currency: string = '¥'): string => {
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// 格式化日期
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 格式化相对时间
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else {
    return formatDate(d, 'MM-DD')
  }
}

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// 获取月份范围
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

// 获取周范围
export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一为第一天
  
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

// 获取年范围
export const getYearRange = (year: number): { start: Date; end: Date } => {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)
  return { start, end }
}

// 计算百分比
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// 获取分类颜色
export const getCategoryColor = (categoryName: string): string => {
  const colors = {
    '餐饮': '#ff6b6b',
    '交通': '#4ecdc4',
    '购物': '#45b7d1',
    '娱乐': '#96ceb4',
    '医疗': '#feca57',
    '教育': '#ff9ff3',
    '住房': '#54a0ff',
    '通讯': '#5f27cd',
    '其他': '#c8d6e5',
    '工资': '#00d2d3',
    '奖金': '#ff6348',
    '投资': '#2ed573',
    '兼职': '#ffa502',
    '礼金': '#ff4757'
  }
  
  return colors[categoryName as keyof typeof colors] || '#c8d6e5'
}

// 获取分类图标
export const getCategoryIcon = (categoryName: string): string => {
  const icons = {
    '餐饮': '🍽️',
    '交通': '🚗',
    '购物': '🛍️',
    '娱乐': '🎮',
    '医疗': '🏥',
    '教育': '📚',
    '住房': '🏠',
    '通讯': '📱',
    '其他': '📦',
    '工资': '💰',
    '奖金': '🎁',
    '投资': '📈',
    '兼职': '💼',
    '礼金': '🧧'
  }
  
  return icons[categoryName as keyof typeof icons] || '📦'
}

// 验证金额
export const validateAmount = (amount: string): { valid: boolean; error?: string } => {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: '请输入金额' }
  }
  
  const num = parseFloat(amount)
  if (isNaN(num)) {
    return { valid: false, error: '请输入有效的数字' }
  }
  
  if (num <= 0) {
    return { valid: false, error: '金额必须大于0' }
  }
  
  if (num > 999999.99) {
    return { valid: false, error: '金额不能超过999,999.99' }
  }
  
  // 检查小数位数
  const decimalPlaces = (amount.split('.')[1] || '').length
  if (decimalPlaces > 2) {
    return { valid: false, error: '最多只能输入2位小数' }
  }
  
  return { valid: true }
}

// 本地存储工具
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('读取本地存储失败:', error)
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('保存到本地存储失败:', error)
      return false
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('删除本地存储失败:', error)
      return false
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('清空本地存储失败:', error)
      return false
    }
  }
}

// 文件下载
export const downloadFile = (content: string, filename: string, type = 'application/json'): void => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 文件读取
export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('文件读取失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 数字格式化（千分位）
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取当前月份的天数
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

// 检查是否为今天
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}

// 检查是否为本月
export const isThisMonth = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}