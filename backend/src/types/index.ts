export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_in: string;
}

export interface Record {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status: number;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface CreateRecordRequest {
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  description?: string;
  date: string;
}

export interface UpdateRecordRequest extends Partial<CreateRecordRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface CreateAccountRequest {
  name: string;
  type: string;
  balance: number;
}