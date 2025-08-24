import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, Record, Category, Account, Feedback } from '../types';

// Ensure environment variables are loaded
dotenv.config();

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is required. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    console.log('Initializing Supabase client with service role key');
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
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
  async getRecords(userId: string, page: number = 1, limit: number = 10): Promise<{ records: any[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      const { data, error, count } = await this.supabase
        .from('records')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching records:', error);
        throw new Error('Failed to fetch records');
      }

      return {
        records: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getRecords:', error);
      throw error;
    }
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
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
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
    try {
      const { data, error } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Error fetching accounts:', error);
        throw new Error('Failed to fetch accounts');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAccounts:', error);
      throw error;
    }
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

  // 统计相关方法
  async getMonthlyStatistics(userId: string, year: number, month: number): Promise<any> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('records')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching monthly statistics:', error);
        throw new Error('Failed to fetch monthly statistics');
      }

      const records = data || [];
      const totalIncome = records
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0);
        
      const totalExpense = records
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0);
      
      const incomeCount = records.filter(record => record.type === 'income').length;
      const expenseCount = records.filter(record => record.type === 'expense').length;
      
      return {
        year,
        month,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeCount,
        expenseCount,
        recordCount: records.length
      };
    } catch (error) {
      console.error('Error in getMonthlyStatistics:', error);
      throw error;
    }
  }

  async getCategoryStatistics(userId: string, startDate: string, endDate: string, type: 'income' | 'expense'): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .select(`
          category_id,
          amount,
          categories!inner(
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .eq('type', type)
        .gte('date', startDate)
        .lte('date', endDate) as { data: any[] | null, error: any };

      if (error) {
        console.error('Error fetching category statistics:', error);
        throw new Error('Failed to fetch category statistics');
      }

      const records = data || [];
      const categoryStats = new Map<string, { amount: number; count: number; categoryName: string; icon: string; color: string }>();
      
      records.forEach((record: any) => {
        const category = record.categories as { id: string; name: string; icon: string; color: string };
        const categoryName = category?.name || '未知分类';
        const icon = category?.icon || '📝';
        const color = category?.color || '#999999';
        
        if (categoryStats.has(record.category_id)) {
          const stats = categoryStats.get(record.category_id)!;
          stats.amount += record.amount;
          stats.count += 1;
        } else {
          categoryStats.set(record.category_id, {
            amount: record.amount,
            count: 1,
            categoryName,
            icon,
            color
          });
        }
      });

      const totalAmount = Array.from(categoryStats.values()).reduce((sum, stats) => sum + stats.amount, 0);
      
      return Array.from(categoryStats.entries()).map(([categoryId, stats]) => ({
        category_id: categoryId,
        category_name: stats.categoryName,
        amount: stats.amount,
        count: stats.count,
        percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0,
        icon: stats.icon,
        color: stats.color
      }));
    } catch (error) {
      console.error('Error in getCategoryStatistics:', error);
      throw error;
    }
  }

  async getAccountStatistics(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .select(`
          account_id,
          amount,
          type,
          accounts!inner(
            id,
            name,
            type
          )
        `)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate) as { data: any[] | null, error: any };

      if (error) {
        console.error('Error fetching account statistics:', error);
        throw new Error('Failed to fetch account statistics');
      }

      const records = data || [];
      const accountStats = new Map<string, { income: number; expense: number; count: number; accountName: string; accountType: string }>();
      
      records.forEach((record: any) => {
        const account = record.accounts as { id: string; name: string; type: string };
        const accountName = account?.name || '未知账户';
        const accountType = account?.type || 'other';
        
        if (accountStats.has(record.account_id)) {
          const stats = accountStats.get(record.account_id)!;
          if (record.type === 'income') {
            stats.income += record.amount;
          } else {
            stats.expense += record.amount;
          }
          stats.count += 1;
        } else {
          accountStats.set(record.account_id, {
            income: record.type === 'income' ? record.amount : 0,
            expense: record.type === 'expense' ? record.amount : 0,
            count: 1,
            accountName,
            accountType
          });
        }
      });
      
      return Array.from(accountStats.entries()).map(([accountId, stats]) => ({
        account_id: accountId,
        account_name: stats.accountName,
        account_type: stats.accountType,
        income: stats.income,
        expense: stats.expense,
        balance: stats.income - stats.expense,
        count: stats.count
      }));
    } catch (error) {
      console.error('Error in getAccountStatistics:', error);
      throw error;
    }
  }
  // Feedback operations
  async getFeedback(userId?: string, page: number = 1, limit: number = 10): Promise<{ feedback: Feedback[], total: number }> {
    let query = this.supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      throw new Error('Failed to fetch feedback');
    }

    return {
      feedback: data || [],
      total: count || 0
    };
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Feedback> {
    const { data, error } = await this.supabase
      .from('feedback')
      .insert({
        ...feedback,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      throw new Error('Failed to create feedback');
    }

    return data;
  }

  async updateFeedbackStatus(id: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed'): Promise<Feedback> {
    const { data, error } = await this.supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback status:', error);
      throw new Error('Failed to update feedback status');
    }

    return data;
  }
}

export default new DatabaseService();