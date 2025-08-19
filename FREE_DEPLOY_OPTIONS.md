# 免费后端部署方案

## 概述

考虑到 Railway 的收费问题，这里为您提供几个免费的后端部署替代方案。每个平台都有其优缺点，您可以根据需求选择最适合的方案。

## 🆓 免费部署平台对比

### 1. Render.com (推荐)

**优点**：
- 🆓 提供免费层级
- 🚀 支持 Node.js 和 TypeScript
- 📦 从 GitHub 自动部署
- 🔄 自动 SSL 证书
- 💾 支持 PostgreSQL 数据库

**限制**：
- 免费服务会在不活跃时休眠
- 每月 750 小时免费使用时间
- 构建时间限制

**部署步骤**：
1. 访问 [render.com](https://render.com)
2. 连接 GitHub 账户
3. 选择您的仓库
4. 设置构建命令：`cd backend && npm install && npm run build`
5. 设置启动命令：`cd backend && npm start`
6. 配置环境变量

### 2. Vercel (Serverless Functions)

**优点**：
- 🆓 慷慨的免费层级
- ⚡ 全球 CDN 加速
- 🔄 自动部署
- 📱 适合 API 路由

**限制**：
- 主要适合无服务器函数
- 执行时间限制（10秒）
- 需要重构为 Serverless 架构

**适用场景**：
- 简单的 API 端点
- 无状态服务

### 3. Netlify Functions

**优点**：
- 🆓 免费层级
- 🔧 易于设置
- 📦 与前端部署集成

**限制**：
- 主要用于无服务器函数
- 执行时间限制
- 冷启动延迟

### 4. Supabase Edge Functions

**优点**：
- 🆓 与 Supabase 数据库集成
- ⚡ 基于 Deno 运行时
- 🌍 全球边缘计算

**限制**：
- 需要使用 Deno/TypeScript
- 相对较新的平台
- 学习曲线

### 5. Heroku (有限免费)

**注意**：Heroku 已取消免费计划，但提供学生优惠和低成本选项。

## 🎯 推荐方案：Render.com

基于您当前的 Node.js + Express 架构，**Render.com** 是最佳的免费替代方案：

### 为什么选择 Render？

1. **完全兼容**：支持您现有的 Node.js 代码
2. **简单迁移**：只需修改部署配置
3. **数据库支持**：提供免费 PostgreSQL
4. **自动部署**：GitHub 集成

### Render 部署配置

我将为您创建 Render 的配置文件：

```yaml
# render.yaml
services:
  - type: web
    name: jizhangben-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

## 🔄 迁移步骤

### 方案 A：使用 Render.com（推荐）

1. **注册 Render 账户**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 登录

2. **创建 Web Service**
   - 选择 "New Web Service"
   - 连接您的 GitHub 仓库
   - 选择 `trae-accounting` 仓库

3. **配置部署设置**
   - **Name**: `jizhangben-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **设置环境变量**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-secret-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

5. **部署**
   - 点击 "Create Web Service"
   - Render 将自动构建和部署

### 方案 B：使用 Vercel Functions

如果选择 Vercel，需要重构为 Serverless 架构：

1. **创建 API 路由结构**
   ```
   api/
   ├── auth/
   │   ├── login.ts
   │   └── register.ts
   ├── records/
   │   ├── index.ts
   │   └── [id].ts
   └── categories/
       └── index.ts
   ```

2. **修改代码结构**
   - 每个文件导出默认函数
   - 使用 Vercel 的请求/响应模式

## 📋 部署后验证

无论选择哪个平台，部署后都需要：

1. **测试 API 端点**
   ```bash
   # 健康检查
   GET https://your-app.onrender.com/api/health
   
   # 用户注册
   POST https://your-app.onrender.com/api/auth/register
   ```

2. **更新前端配置**
   - 修改前端的 API 基础 URL
   - 指向新的部署域名

3. **配置 CORS**
   - 确保后端允许前端域名访问

## 💡 建议

1. **首选 Render.com**：最接近 Railway 的体验
2. **备选 Vercel**：如果愿意重构为 Serverless
3. **考虑 Supabase**：如果想要完全托管的后端解决方案

## 🔧 需要帮助？

如果您选择了某个平台，我可以帮您：
- 创建相应的配置文件
- 修改部署脚本
- 更新文档
- 协助迁移过程

请告诉我您倾向于哪个方案，我将为您提供详细的迁移指导！