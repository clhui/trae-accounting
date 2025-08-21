import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, AuthRequest, AuthResponse, JwtPayload } from '../types';

// Ensure environment variables are loaded
dotenv.config();

class AuthService {
  private supabase;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private mockUsers: Map<string, User> = new Map();

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
      console.warn(`Missing Supabase configuration: URL=${supabaseUrl ? 'SET' : 'NOT SET'}, KEY=${supabaseServiceKey ? 'SET' : 'NOT SET'}. Running in MOCK mode (no DB calls).`);
      // @ts-ignore - allow null for mock mode
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    if (!this.jwtSecret || this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }

  async signUp(authRequest: AuthRequest): Promise<AuthResponse> {
    const { email, password } = authRequest;
    const username = (authRequest as any).username; // Optional username

    try {
      // Temporary mock implementation for development
      // TODO: Replace with proper Supabase admin.createUser() when service role key is configured
      console.log('Mock user registration for development:', { email, username });
      
      // Generate a mock user ID
      const mockUserId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create mock user data
      const userData = {
        id: mockUserId,
        email: email,
        username: username || email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store mock user in memory
      this.mockUsers.set(mockUserId, userData);
      
      console.log('Created mock user:', userData);

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
    const { email, password } = authRequest;

    try {
      // Temporary mock implementation for development
      // TODO: Replace with proper Supabase auth when service role key is configured
      console.log('Mock user login for development:', { email });
      
      // For development, accept any email/password combination
      // In a real implementation, this would validate against stored credentials
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create mock user data for login
      const userData = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        username: email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store mock user in memory
      this.mockUsers.set(userData.id, userData);
      
      console.log('Mock login successful for user:', userData);

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
      // For mock users, return mock user data
      if (id.startsWith('mock_')) {
        // Extract email from mock user ID if available, otherwise use default
        const email = this.mockUsers.get(id)?.email || 'mock@example.com';
        return {
          id: id,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      if (!this.supabase) {
        console.warn('Supabase not configured, cannot fetch real user');
        return null;
      }

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
      if (!this.supabase) {
        console.warn('Supabase not configured, cannot fetch user by email');
        return null;
      }

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
      console.error('RefreshToken error:', error);
      throw error;
    }
  }
}

export { AuthService };
export default AuthService;