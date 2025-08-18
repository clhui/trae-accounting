# 项目部署指南

## 🚀 快速部署步骤

### 1. 前端部署到 Vercel

#### 方法一：通过 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录 Vercel
vercel login
# 选择你的登录方式（GitHub、Google、Email 等）

# 3. 在项目根目录部署
vercel --prod
# 按提示配置项目设置
```

#### 方法二：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/Google 账户登录
3. 点击 "New Project"
4. 导入你的 Git 仓库或上传项目文件
5. 配置构建设置：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Deploy"

### 2. 后端部署到 Vercel

```bash
# 进入后端目录
cd backend

# 部署后端
vercel --prod
```

### 3. 环境变量配置

#### 前端环境变量（在 Vercel Dashboard 中设置）

```env
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 后端环境变量（在 Vercel Dashboard 中设置）

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🔧 详细配置步骤

### 步骤 1：准备 Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目或使用现有项目
3. 在项目设置中获取：
   - Project URL
   - anon public key
   - service_role secret key
4. 在 SQL Editor 中运行数据库表创建脚本（参考 `CLOUD_SETUP.md`）

### 步骤 2：部署后端

1. 确保后端代码已构建：
   ```bash
   cd backend
   npm run build
   ```

2. 部署到 Vercel：
   ```bash
   vercel --prod
   ```

3. 在 Vercel Dashboard 中配置环境变量

4. 测试后端 API：
   ```bash
   curl https://your-backend-domain.vercel.app/api/health
   ```

### 步骤 3：部署前端

1. 更新前端 API 配置：
   ```typescript
   // src/services/backendApi.ts
   const API_BASE_URL = 'https://your-backend-domain.vercel.app';
   ```

2. 构建前端：
   ```bash
   npm run build
   ```

3. 部署到 Vercel：
   ```bash
   vercel --prod
   ```

4. 在 Vercel Dashboard 中配置环境变量

### 步骤 4：更新 CORS 配置

在后端的环境变量中更新 `FRONTEND_URL` 为实际的前端域名：
```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🧪 部署验证

### 1. 后端 API 测试

```bash
# 健康检查
curl https://your-backend-domain.vercel.app/api/health

# 用户注册测试
curl -X POST https://your-backend-domain.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 用户登录测试
curl -X POST https://your-backend-domain.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. 前端功能测试

1. 访问前端域名
2. 测试用户注册/登录
3. 测试记录添加/查看
4. 测试分类管理
5. 测试账户管理

## 🔒 安全检查清单

- [ ] JWT_SECRET 已更改为强密码（至少32个字符）
- [ ] 使用 service_role 密钥而不是 anon 密钥
- [ ] CORS 配置指向正确的前端域名
- [ ] 所有敏感信息都通过环境变量配置
- [ ] Supabase 行级安全策略已启用
- [ ] API 端点都有适当的认证保护

## 🚨 常见问题解决

### CORS 错误
- 检查后端 `FRONTEND_URL` 环境变量
- 确保前端域名正确配置

### 数据库连接失败
- 验证 Supabase URL 和密钥
- 检查数据库表是否已创建

### JWT 验证失败
- 确认前后端使用相同的 JWT_SECRET
- 检查 token 是否正确传递

### 权限错误
- 确保使用 service_role 密钥
- 检查 Supabase 行级安全策略

## 📞 获取帮助

如果遇到部署问题，请检查：
1. Vercel 部署日志
2. 浏览器开发者工具控制台
3. 网络请求状态
4. 环境变量配置

## 🎉 部署完成

部署成功后，你将获得：
- 前端应用 URL：`https://your-frontend-domain.vercel.app`
- 后端 API URL：`https://your-backend-domain.vercel.app`

现在你可以分享应用链接，让用户开始使用你的记账应用了！