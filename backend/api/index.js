const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-must-be-at-least-32-characters-long';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth Helper Functions
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        status: 401
      }
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        status: 403
      }
    });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          status: 400
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long',
          status: 400
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          status: 400
        }
      });
    }

    // Mock user registration for development
    console.log('Mock user registration for development:', { email, username });
    
    const mockUserId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userData = {
      id: mockUserId,
      email: email,
      username: username || email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Created mock user:', userData);

    const token = generateToken(userData);

    res.status(201).json({
      success: true,
      data: {
        user: userData,
        token,
        expires_in: JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('SignUp error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          status: 400
        }
      });
    }

    // Mock user login for development
    console.log('Mock user login for development:', { email });
    
    const userData = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email,
      username: email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Mock login successful for user:', userData);

    const token = generateToken(userData);

    res.json({
      success: true,
      data: {
        user: userData,
        token,
        expires_in: JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('SignIn error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
        status: 401
      }
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token required',
          status: 401
        }
      });
    }

    const decoded = verifyToken(token);
    
    // For mock users, return mock user data
    const userData = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newToken = generateToken(userData);

    res.json({
      success: true,
      data: {
        user: userData,
        token: newToken,
        expires_in: JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('RefreshToken error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          status: 401
        }
      });
    }

    // Return mock user profile for mock users
    const mockUser = {
      id: req.user.userId,
      email: req.user.email,
      username: req.user.email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockUser
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Export for Vercel Serverless Functions
module.exports = (req, res) => {
  return app(req, res);
};