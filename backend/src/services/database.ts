import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, Record, Category, Account } from '../types';

// Ensure environment variables are loaded
dotenv.config();

class DatabaseService {
  private supabase: SupabaseClient;
  private mockData: {
    users: User[];
    records: Record[];
    categories: Category[];
    accounts: Account[];
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Initialize mock data for development
    this.mockData = {
      users: [],
      records: [],
      categories: [
        {
          id: 'cat_1',
          name: '餐饮',
          type: 'expense',
          icon: '🍽️',
          color: '#FF6B6B',
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_2',
          name: '交通',
          type: 'expense',
          icon: '🚗',
          color: '#4ECDC4',
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cat_3',
          name: '工资',
          type: 'income',
          icon: '💰',
          color: '#45B7D1',
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      accounts: [
        {
          id: 'acc_1',
          name: '现金',
          type: 'cash',
          balance: 1000,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'acc_2',
          name: '银行卡',
          type: 'bank',
          balance: 5000,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  // User operations
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  }

  // Record operations
  async getRecords(userId: string, limit?: number, offset?: number): Promise<Record[]> {
    // For mock users, return mock data
    if (userId.startsWith('mock_')) {
      console.log('Returning mock records for user:', userId);
      
      // Create some sample records for the mock user
      const mockRecords: Record[] = [
        {
          id: 'rec_1',
          amount: 25.50,
          type: 'expense',
          category_id: 'cat_1',
          account_id: 'acc_1',
          description: '午餐',
          date: new Date().toISOString().split('T')[0],
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'rec_2',
          amount: 3000,
          type: 'income',
          category_id: 'cat_3',
          account_id: 'acc_2',
          description: '工资',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Apply pagination if specified
      let result = mockRecords;
      if (offset !== undefined) {
        result = result.slice(offset);
      }
      if (limit !== undefined) {
        result = result.slice(0, limit);
      }
      
      return result;
    }
    
    // For real users, use Supabase
    let query = this.supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching records: ${error.message}`);
    }

    return data || [];
  }

  async getRecordById(id: string, userId: string): Promise<Record | null> {
    const { data, error } = await this.supabase
      .from('records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching record:', error);
      return null;
    }

    return data;
  }

  async createRecord(record: Omit<Record, 'id' | 'created_at' | 'updated_at'>): Promise<Record> {
    // For mock users, simulate record creation
    if (record.user_id.startsWith('mock_')) {
      const newRecord: Record = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Created mock record:', newRecord);
      return newRecord;
    }
    
    // For real users, use Supabase
    const { data, error } = await this.supabase
      .from('records')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating record: ${error.message}`);
    }

    return data;
  }

  async updateRecord(id: string, userId: string, updates: Partial<Record>): Promise<Record> {
    const { data, error } = await this.supabase
      .from('records')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }

    return data;
  }

  async deleteRecord(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting record: ${error.message}`);
    }
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data || [];
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }

    return data;
  }

  async updateCategory(id: string, userId: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }

    return data;
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Account operations
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      throw new Error(`Error fetching accounts: ${error.message}`);
    }

    return data || [];
  }

  async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating account: ${error.message}`);
    }

    return data;
  }

  async updateAccount(id: string, userId: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating account: ${error.message}`);
    }

    return data;
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting account: ${error.message}`);
    }
  }
}

export default new DatabaseService();