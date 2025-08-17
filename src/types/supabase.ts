export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          account_id: string
          description?: string
          date: string
          created_at: string
          updated_at: string
          synced_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          account_id: string
          description?: string
          date: string
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          category_id?: string
          account_id?: string
          description?: string
          date?: string
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          is_default: boolean
          created_at: string
          updated_at: string
          synced_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'credit' | 'other'
          balance: number
          icon?: string
          color?: string
          is_default: boolean
          created_at: string
          updated_at: string
          synced_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'credit' | 'other'
          balance?: number
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'credit' | 'other'
          balance?: number
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          year: number
          month?: number
          created_at: string
          updated_at: string
          synced_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          year: number
          month?: number
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'monthly' | 'yearly'
          year?: number
          month?: number
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}