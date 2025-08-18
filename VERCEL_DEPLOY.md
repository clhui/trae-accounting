# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 前提条件

1. **Vercel 账户** - 访问 [vercel.com](https://vercel.com) 注册
2. **Vercel CLI** - 已安装（如果未安装，运行 `npm install -g vercel`）
3. **项目已构建** - 运行 `./deploy.bat` 或 `./deploy.sh`

### 步骤 1: 登录 Vercel

```bash
vercel login
```

选择你的登录方式（GitHub、Google 等）

### 步骤 2: 部署后端 API

```bash
cd backend
vercel --prod
```

**配置选项：**
- 项目名称：`jizhangben-backend`（或你喜欢的名称）
- 框架：选择 "Other" 或 "Express.js"
- 构建命令：`npm run build`
- 输出目录：`dist`
- 开发命令：`npm run dev`

**重要：记录后端部署的 URL**，例如：`https://jizhangben-backend.vercel.app`

### 步骤 3: 配置后端环境变量

在 Vercel Dashboard 中设置以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 步骤 4: 部署前端

```bash
cd ..
vercel --prod
```

**配置选项：**
- 项目名称：`jizhangben-frontend`（或你喜欢的名称）
- 框架：选择 "Vue.js"
- 构建命令：`npm run build`
- 输出目录：`dist`
- 开发命令：`npm run dev`

### 步骤 5: 配置前端环境变量

在 Vercel Dashboard 中设置以下环境变量：

```env
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=记账本
VITE_APP_VERSION=1.0.0
```

### 步骤 6: 重新部署前端

设置环境变量后，重新部署前端以应用配置：

```bash
vercel --prod
```

## 🔧 Supabase 配置

### 获取 Supabase 密钥

1. 访问 [supabase.com](https://supabase.com)
2. 登录并选择你的项目
3. 进入 Settings > API
4. 复制以下信息：
   - **Project URL** → `VITE_SUPABASE_URL` 和 `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 配置 CORS

在 Supabase Dashboard 中：
1. 进入 Authentication > Settings
2. 在 "Site URL" 中添加你的前端域名
3. 在 "Additional URLs" 中添加：
   - `https://your-frontend-domain.vercel.app`
   - `https://your-backend-domain.vercel.app`

## ✅ 验证部署

### 1. 检查后端健康状态

访问：`https://your-backend-domain.vercel.app/api/health`

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "production"
}
```

### 2. 测试前端应用

访问：`https://your-frontend-domain.vercel.app`

- 检查页面是否正常加载
- 测试用户注册/登录功能
- 验证 API 调用是否正常

## 🔄 更新部署

### 更新后端
```bash
cd backend
npm run build
vercel --prod
```

### 更新前端
```bash
npm run build
vercel --prod
```

## 🐛 常见问题

### 1. API 调用失败
- 检查 `VITE_API_URL` 是否正确设置
- 确认后端部署成功且健康检查通过
- 检查 CORS 配置

### 2. 认证问题
- 验证 Supabase 密钥是否正确
- 检查 JWT_SECRET 是否设置
- 确认 Supabase CORS 配置

### 3. 构建失败
- 检查依赖是否完整安装
- 验证 TypeScript 类型错误
- 查看 Vercel 构建日志

### 4. 环境变量不生效
- 确认在 Vercel Dashboard 中正确设置
- 重新部署应用以应用新的环境变量
- 检查变量名称是否正确（区分大小写）

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Supabase 文档**: https://supabase.com/docs
- **项目 Issues**: 在项目仓库中提交问题

---

**部署成功后，你的记账本应用就可以在全球范围内访问了！** 🎉