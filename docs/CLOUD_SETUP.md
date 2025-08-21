# 云数据库集成配置指南

本应用已集成 Supabase 云数据库，支持数据云端同步、用户认证和离线模式。

## 功能特性

- ✅ **多模式存储**: 支持本地、云端、混合三种存储模式
- ✅ **用户认证**: 集成 Supabase 用户注册/登录系统
- ✅ **数据同步**: 自动同步本地和云端数据
- ✅ **离线支持**: 离线时自动缓存操作，联网后自动同步
- ✅ **冲突解决**: 智能处理数据冲突，保证数据一致性
- ✅ **网络监测**: 实时监测网络状态，智能切换存储模式

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 创建新项目
3. 等待项目初始化完成
4. 在项目设置中获取以下信息：
   - Project URL
   - API Key (anon/public)

### 2. 配置环境变量

1. 复制 `.env.example` 文件为 `.env`
2. 填入你的 Supabase 配置信息：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL 语句创建必要的表：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 记录表
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  category_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分类表
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 账户表
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 预算表
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own records" ON records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON records FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);
```

### 4. 配置认证

在 Supabase 项目的 Authentication 设置中：

1. 启用 Email 认证
2. 配置邮件模板（可选）
3. 设置重定向 URL（开发环境：`http://localhost:5173`）

## 使用方法

### 测试云数据库功能

1. 启动应用：`npm run dev`
2. 访问设置页面
3. 点击「云数据库测试」
4. 在测试页面中：
   - 注册新用户或登录现有用户
   - 测试数据同步功能
   - 查看网络状态和连接状态
   - 添加测试记录验证功能

### 存储模式说明

- **本地模式 (local)**: 仅使用本地 IndexedDB 存储
- **云端模式 (cloud)**: 仅使用 Supabase 云端存储
- **混合模式 (hybrid)**: 智能切换，在线时使用云端，离线时使用本地

### 数据同步机制

- **自动同步**: 用户登录后自动触发数据同步
- **手动同步**: 在测试页面或设置中手动触发同步
- **冲突解决**: 采用"最后更新优先"策略解决数据冲突
- **离线队列**: 离线时操作会被缓存，联网后自动执行

## 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 验证 Supabase URL 和 API Key
   - 确认 Supabase 项目状态

2. **认证失败**
   - 检查邮箱格式
   - 确认密码强度要求
   - 查看 Supabase 认证设置

3. **数据同步失败**
   - 检查用户权限
   - 验证数据库表结构
   - 查看浏览器控制台错误信息

### 调试工具

- 使用云数据库测试页面查看详细状态
- 检查浏览器开发者工具的网络面板
- 查看 Supabase 项目的日志面板

## 安全注意事项

- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置
- 定期更新 API 密钥
- 启用行级安全策略保护数据
- 在生产环境中配置适当的 CORS 设置

## 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vue 前端应用   │    │  混合数据库服务  │    │   Supabase 云端  │
│                │    │                │    │                │
│ - 用户界面      │◄──►│ - 模式切换      │◄──►│ - 用户认证      │
│ - 状态管理      │    │ - 数据同步      │    │ - 数据存储      │
│ - 路由管理      │    │ - 冲突解决      │    │ - 实时更新      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   本地存储      │    │   离线服务      │    │   网络监测      │
│                │    │                │    │                │
│ - IndexedDB     │    │ - 操作队列      │    │ - 连接状态      │
│ - 本地缓存      │    │ - 自动重试      │    │ - 状态通知      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 更新日志

- **v1.0.0**: 初始版本，支持基本的云数据库集成功能
- 用户认证系统
- 数据同步机制
- 离线模式支持
- 网络状态监测