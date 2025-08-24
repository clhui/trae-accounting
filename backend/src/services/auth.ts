import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, AuthRequest, AuthResponse, JwtPayload } from '../types';
import EmailService from './email';

// Ensure environment variables are loaded
dotenv.config();

class AuthService {
  private supabase;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private emailService: EmailService;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    console.log('Environment variables:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
      supabaseServiceKey: supabaseServiceKey ? 'SET' : 'NOT SET',
      jwtSecret: this.jwtSecret ? 'SET' : 'NOT SET'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is required. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.emailService = new EmailService();

    if (!this.jwtSecret || this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }

  async signUp(authRequest: AuthRequest): Promise<AuthResponse> {
    const { identifier: email, password } = authRequest;
    const username = authRequest.username; // Optional username

    try {
      const finalUsername = username || email.split('@')[0];
      
      // Check if user already exists by email
      const { data: existingUserByEmail } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingUserByEmail) {
        throw new Error('User already exists with this email');
      }
      
      // Check if username already exists
      const { data: existingUserByUsername } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', finalUsername)
        .single();
      
      if (existingUserByUsername) {
        throw new Error('User already exists with this username');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      console.log('User registration:', { email, username: finalUsername });
      
      // Create user in database
      const { data: userData, error } = await this.supabase
        .from('users')
        .insert({
          email: email,
          username: finalUsername,
          password_hash: hashedPassword
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database error during signup:', error);
        throw new Error('Failed to create user account');
      }
      
      console.log('Created user:', userData);

      // Create default categories and accounts for the new user
      try {
        await this.createDefaultUserData(userData.id);
        console.log('Created default data for user:', userData.id);
      } catch (defaultDataError) {
        console.error('Failed to create default data:', defaultDataError);
        // Don't throw error here, user creation was successful
      }

      // Generate JWT token
      const token = this.generateToken(userData);

      return {
        user: userData,
        token,
        expires_in: this.jwtExpiresIn
      };
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async signIn(authRequest: AuthRequest): Promise<AuthResponse> {
    const { identifier, password } = authRequest;

    try {
      console.log('User login attempt:', { identifier });
      
      // Validate input
      if (!identifier || !password) {
        throw new Error('账户和密码不能为空');
      }
      
      // 判断是邮箱还是用户名
      const isEmail = identifier.includes('@');
      
      // Find user by email or username
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('*')
        .or(isEmail ? `email.eq.${identifier}` : `username.eq.${identifier}`)
        .single();
      
      if (error || !userData) {
        throw new Error('账户或密码错误');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
      if (!isPasswordValid) {
        throw new Error('账户或密码错误');
      }
      
      console.log('Login successful for user:', { identifier, userId: userData.id, email: userData.email, username: userData.username });

      // Generate JWT token
      const token = this.generateToken(userData);

      return {
        user: userData,
        token,
        expires_in: this.jwtExpiresIn
      };
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
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
    } catch (error) {
      console.error('getUserById error:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
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
    } catch (error) {
      console.error('getUserByEmail error:', error);
      return null;
    }
  }

  generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async createDefaultUserData(userId: string): Promise<void> {
    // Create default income categories
    const incomeCategories = [
      { name: '工资', icon: '💰', color: '#4CAF50' },
      { name: '奖金', icon: '🎁', color: '#8BC34A' },
      { name: '投资收益', icon: '📈', color: '#2196F3' },
      { name: '兼职收入', icon: '💼', color: '#FF9800' },
      { name: '其他收入', icon: '💵', color: '#9C27B0' }
    ];

    // Create default expense categories
    const expenseCategories = [
      { name: '餐饮', icon: '🍽️', color: '#F44336' },
      { name: '交通', icon: '🚗', color: '#FF5722' },
      { name: '购物', icon: '🛍️', color: '#E91E63' },
      { name: '娱乐', icon: '🎮', color: '#9C27B0' },
      { name: '医疗', icon: '🏥', color: '#607D8B' },
      { name: '教育', icon: '📚', color: '#3F51B5' },
      { name: '住房', icon: '🏠', color: '#795548' },
      { name: '通讯', icon: '📱', color: '#009688' },
      { name: '水电费', icon: '💡', color: '#FFC107' },
      { name: '其他支出', icon: '💸', color: '#757575' }
    ];

    // Create default accounts
    const defaultAccounts = [
      { name: '现金', type: '现金' },
      { name: '银行卡', type: '银行卡' },
      { name: '支付宝', type: '电子钱包' },
      { name: '微信钱包', type: '电子钱包' },
      { name: '信用卡', type: '信用卡' }
    ];

    // Insert income categories
    const incomeData = incomeCategories.map(cat => ({
      user_id: userId,
      name: cat.name,
      type: 'income',
      icon: cat.icon,
      color: cat.color
    }));

    await this.supabase
      .from('categories')
      .insert(incomeData);

    // Insert expense categories
    const expenseData = expenseCategories.map(cat => ({
      user_id: userId,
      name: cat.name,
      type: 'expense',
      icon: cat.icon,
      color: cat.color
    }));

    await this.supabase
      .from('categories')
      .insert(expenseData);

    // Insert default accounts
    const accountData = defaultAccounts.map(acc => ({
      user_id: userId,
      name: acc.name,
      type: acc.type,
      balance: 0.00
    }));

    await this.supabase
      .from('accounts')
      .insert(accountData);
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.getUserById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken(user);
      
      return {
        user,
        token: newToken,
        expires_in: this.jwtExpiresIn
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      // 查找用户
      const user = await this.getUserByEmail(email);
      if (!user) {
        // 为了安全考虑，即使用户不存在也返回成功消息
        return;
      }

      // 生成重置令牌（6小时有效期）
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '6h' }
      );

      // 存储重置令牌到数据库（可选，用于额外验证）
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6小时后过期
      
      await this.supabase
        .from('password_reset_tokens')
        .upsert({
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      // 发送重置邮件
       await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      console.log(`Password reset email sent to ${email}`);
      
    } catch (error) {
      console.error('Request password reset error:', error);
      throw new Error('发送重置邮件失败');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // 验证重置令牌
      let decoded: any;
      try {
        decoded = jwt.verify(token, this.jwtSecret) as any;
      } catch (error) {
        throw new Error('重置令牌无效或已过期');
      }

      if (decoded.type !== 'password_reset') {
        throw new Error('无效的重置令牌');
      }

      // 检查令牌是否已使用
      const { data: tokenRecord } = await this.supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (!tokenRecord) {
        throw new Error('重置令牌无效或已使用');
      }

      // 检查令牌是否过期
      if (new Date() > new Date(tokenRecord.expires_at)) {
        throw new Error('重置令牌已过期');
      }

      // 获取用户
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 加密新密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // 更新用户密码
      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('更新密码失败');
      }

      // 标记令牌为已使用
      await this.supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      console.log(`Password reset successful for user ${user.email}`);
      
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export { AuthService };
export default AuthService;