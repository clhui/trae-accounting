// 记录类型
export interface Record {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  accountId: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 账户类型
export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'other';
  balance: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 预算类型
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  year: number;
  month?: number;
  createdAt: string;
  updatedAt: string;
}

// 月度统计类型
export interface MonthlyStats {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  balance: number;
}

// 分类统计类型
export interface CategoryStats {
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  count: number;
  percentage: number;
}

// 查询参数类型
export interface QueryParams {
  type?: 'income' | 'expense';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// 表单数据类型
export interface RecordFormData {
  type: 'income' | 'expense';
  amount: string;
  categoryId: string;
  accountId: string;
  note: string;
  date: string;
}

// 应用设置类型
export interface AppSettings {
  theme: 'auto' | 'light' | 'dark';
  currency: string;
  language: 'zh-CN' | 'en-US';
  autoBackup: boolean;
  budgetAlert: boolean;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 登录表单数据
export interface LoginFormData {
  username: string;
  password: string;
}

// 注册表单数据
export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 图表数据类型
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// 趋势数据类型
export interface TrendData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}