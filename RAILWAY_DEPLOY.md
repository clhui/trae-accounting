# Railway 部署指南

## 概述

本指南将帮助您将后端 API 部署到 Railway 平台。Railway 是一个现代化的云平台，支持从 GitHub 仓库直接部署应用。

## 前提条件

- ✅ GitHub 仓库已创建并推送代码
- ✅ 后端代码已准备就绪
- ✅ Railway 配置文件已创建
- 📧 Railway 账户（免费注册）

## 部署步骤

### 1. 注册 Railway 账户

1. 访问 [Railway.app](https://railway.app)
2. 点击 "Start a New Project"
3. 使用 GitHub 账户登录
4. 授权 Railway 访问您的 GitHub 仓库

### 2. 创建新项目

1. 在 Railway 控制台中，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择您的仓库：`trae-accounting`
4. Railway 会自动检测到这是一个 Node.js 项目

### 3. 配置部署设置

1. **选择根目录**：
   - 点击项目设置
   - 在 "Root Directory" 中输入：`backend`
   - 这告诉 Railway 从 backend 目录部署

2. **构建命令**（通常自动检测）：
   ```bash
   npm install && npm run build
   ```

3. **启动命令**（通常自动检测）：
   ```bash
   npm start
   ```

### 4. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**重要提示**：
- 将 `your-super-secret-jwt-key-here` 替换为强密码
- 从 Supabase 控制台获取 URL 和密钥
- 使用您的前端 Vercel 域名

### 5. 部署

1. 配置完成后，点击 "Deploy"
2. Railway 将自动：
   - 克隆您的代码
   - 安装依赖
   - 构建项目
   - 启动服务

### 6. 获取部署 URL

部署成功后：
1. 在项目概览中找到 "Domains" 部分
2. Railway 会提供一个类似这样的 URL：
   ```
   https://your-app-name.up.railway.app
   ```
3. 记录这个 URL，稍后需要在前端配置中使用

## 验证部署

### 测试 API 端点

使用浏览器或 Postman 测试以下端点：

```bash
# 健康检查
GET https://your-app-name.up.railway.app/api/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "production"
}
```

### 测试认证端点

```bash
# 注册测试
POST https://your-app-name.up.railway.app/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 Railway 构建日志
   - 确认 `backend/package.json` 中的脚本正确
   - 验证 Node.js 版本兼容性

2. **环境变量问题**
   - 确认所有必需的环境变量已设置
   - 检查 Supabase 密钥是否正确
   - 验证 JWT_SECRET 已设置

3. **CORS 错误**
   - 确认 FRONTEND_URL 环境变量正确
   - 检查前端域名是否匹配

### 查看日志

在 Railway 控制台中：
1. 点击您的项目
2. 选择 "Deployments" 标签
3. 点击最新部署查看详细日志

## 下一步

部署成功后：

1. **更新前端配置**：
   - 修改前端的 API 基础 URL
   - 指向新的 Railway 域名

2. **配置 Supabase**：
   - 在 Supabase 项目设置中添加 Railway 域名到允许的源

3. **测试完整流程**：
   - 注册新用户
   - 登录验证
   - 数据同步测试

## 自动部署

Railway 支持自动部署：
- 每次推送到 `main` 分支时自动重新部署
- 无需手动操作
- 支持回滚到之前的版本

## 监控和维护

- Railway 提供实时日志监控
- 支持自定义域名
- 提供使用量统计
- 支持环境变量热更新

---

**部署完成后，请查看 `POST_DEPLOY_CONFIG.md` 了解后续配置步骤。**