# 记账本应用

一个现代化的个人记账管理应用，支持收支记录、分类管理、账户管理和数据统计。

## ✨ 功能特性

- 📊 **收支记录管理** - 添加、编辑、删除收支记录
- 🏷️ **分类管理** - 自定义收入和支出分类
- 💳 **账户管理** - 管理多个账户（现金、银行卡等）
- 📈 **数据统计** - 可视化图表展示财务状况
- 👤 **用户认证** - 安全的用户注册和登录
- 📱 **响应式设计** - 支持桌面和移动设备
- 🔄 **PWA 支持** - 可安装为桌面应用

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Chart.js** - 数据可视化
- **PWA** - 渐进式 Web 应用

### 后端
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **TypeScript** - 类型安全的 JavaScript
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **Supabase** - 数据库和认证服务

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账户（可选，用于云端数据存储）

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd trae记账本
   ```

2. **安装依赖**
   ```bash
   # 安装前端依赖
   npm install
   
   # 安装后端依赖
   cd backend
   npm install
   cd ..
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # 编辑环境变量文件，填入你的配置
   ```

4. **启动开发服务器**
   ```bash
   # 启动后端服务器（端口 3002）
   cd backend
   npm run dev
   
   # 新开终端，启动前端服务器（端口 3000）
   cd ..
   npm run dev
   ```

5. **访问应用**
   - 前端：http://localhost:3000
   - 后端 API：http://localhost:3002

## 📦 部署

### 快速部署

使用提供的部署脚本：

```bash
# Windows
.\deploy.bat

# Linux/macOS
./deploy.sh
```

### 手动部署

详细的部署指南请查看：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

#### 部署到 Vercel（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署后端**
   ```bash
   cd backend
   vercel --prod
   ```

4. **部署前端**
   ```bash
   cd ..
   vercel --prod
   ```

5. **配置环境变量**
   在 Vercel Dashboard 中设置生产环境变量

## 🔧 配置

### 环境变量

#### 前端环境变量
```env
VITE_API_URL=http://localhost:3002/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 后端环境变量
```env
NODE_ENV=development
PORT=3002
JWT_SECRET=your-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

### Supabase 配置

详细的 Supabase 配置指南请查看：[SUPABASE_CONFIG.md](./SUPABASE_CONFIG.md)

## 📁 项目结构

```
记账本/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── pages/             # 页面组件
│   ├── services/          # API 服务
│   ├── stores/            # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── backend/               # 后端源码
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   ├── services/      # 服务层
│   │   ├── middleware/    # 中间件
│   │   └── types/         # 类型定义
│   └── dist/              # 构建输出
├── dist/                  # 前端构建输出
└── docs/                  # 文档
```

## 🧪 测试

```bash
# 运行前端测试
npm run test

# 运行后端测试
cd backend
npm run test
```

## 📖 API 文档

### 认证 API

- `POST /api/auth/signup` - 用户注册
- `POST /api/auth/signin` - 用户登录
- `POST /api/auth/refresh` - 刷新 token

### 记录 API

- `GET /api/records` - 获取记录列表
- `POST /api/records` - 创建新记录
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录

### 分类 API

- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 账户 API

- `GET /api/accounts` - 获取账户列表
- `POST /api/accounts` - 创建新账户
- `PUT /api/accounts/:id` - 更新账户
- `DELETE /api/accounts/:id` - 删除账户

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 获取帮助

如果遇到问题，请：

1. 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. 检查 [常见问题](./DEPLOYMENT_GUIDE.md#常见问题解决)
3. 提交 Issue

---

**享受记账的乐趣！** 💰✨