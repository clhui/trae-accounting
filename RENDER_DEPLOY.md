# Render.com 部署指南

## 🎯 为什么选择 Render？

Render.com 是 Railway 的最佳免费替代方案：<mcreference link="https://medium.com/starbugs/render-來試試用來取代-heroku-的服務吧-render-的網路服務部署介紹-b728e86d5716" index="1">1</mcreference>

- ✅ **完全免费**：提供慷慨的免费层级
- 🚀 **零配置**：支持 Node.js 和 TypeScript
- 📦 **自动部署**：GitHub 集成，代码推送即部署
- 🔒 **HTTPS**：自动 SSL 证书
- 💾 **数据库**：免费 PostgreSQL（如需要）

## 📋 部署前准备

### 检查文件
确保以下文件存在：
- ✅ `backend/package.json` - 包含启动脚本
- ✅ `backend/render.yaml` - Render 配置文件
- ✅ `backend/.env.example` - 环境变量模板
- ✅ 代码已推送到 GitHub

## 🚀 部署步骤

### 1. 注册 Render 账户

1. 访问 [render.com](https://render.com)
2. 点击 "Get Started for Free"
3. 选择 "GitHub" 登录
4. 授权 Render 访问您的 GitHub 仓库

### 2. 创建 Web Service

1. 在 Render 控制台中，点击 "New +"
2. 选择 "Web Service"
3. 连接您的 GitHub 账户（如果还没有）
4. 选择仓库：`trae-accounting`
5. 点击 "Connect"

### 3. 配置服务设置

在配置页面填写以下信息：

**基本设置**：
- **Name**: `jizhangben-backend`
- **Region**: `Oregon (US West)` 或选择离您更近的区域
- **Branch**: `main`
- **Root Directory**: `backend`

**构建设置**：
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

**高级设置**：
- **Auto-Deploy**: `Yes` (推荐)
- **Health Check Path**: `/api/health`

### 4. 配置环境变量

在 "Environment" 部分添加以下变量：

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**重要提示**：
- 🔑 `JWT_SECRET`: 生成一个强密码（建议 32+ 字符）
- 🔗 从 Supabase 控制台获取 URL 和密钥
- 🌐 `FRONTEND_URL`: 使用您的 Vercel 前端域名

### 5. 部署

1. 检查所有配置无误
2. 点击 "Create Web Service"
3. Render 将开始构建过程：
   - 📥 克隆代码
   - 📦 安装依赖 (`npm install`)
   - 🔨 构建项目 (`npm run build`)
   - 🚀 启动服务 (`npm start`)

### 6. 获取部署 URL

部署成功后，您将获得一个 URL：
```
https://jizhangben-backend.onrender.com
```

## ✅ 验证部署

### 测试健康检查

```bash
# 使用浏览器或 curl 测试
GET https://jizhangben-backend.onrender.com/api/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "production"
}
```

### 测试认证端点

```bash
# 测试用户注册
POST https://jizhangben-backend.onrender.com/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

## 🔧 更新前端配置

部署成功后，需要更新前端配置：

### 1. 更新环境变量

在前端项目中，更新 `.env.production`：

```env
VITE_API_URL=https://jizhangben-backend.onrender.com/api
```

### 2. 重新部署前端

```bash
# 如果使用 Vercel
npm run build
vercel --prod
```

## 🔄 自动部署

Render 支持自动部署：
- ✅ 每次推送到 `main` 分支自动重新部署
- ✅ 支持 Pull Request 预览
- ✅ 部署历史和回滚功能

## 📊 监控和日志

### 查看日志
1. 在 Render 控制台中选择您的服务
2. 点击 "Logs" 标签
3. 实时查看应用日志

### 监控指标
- CPU 和内存使用情况
- 请求数量和响应时间
- 错误率统计

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查 package.json 中的脚本
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

2. **启动失败**
   - 检查 `PORT` 环境变量是否设置为 `10000`
   - 确认启动命令正确

3. **环境变量问题**
   - 验证所有必需的环境变量已设置
   - 检查 Supabase 密钥是否正确

4. **CORS 错误**
   - 确认 `FRONTEND_URL` 环境变量正确
   - 检查前端域名是否匹配

### 调试步骤

1. **查看构建日志**：在 Render 控制台查看详细的构建过程
2. **检查运行时日志**：查看应用启动和运行时的日志
3. **测试本地构建**：在本地运行 `npm run build` 确保构建成功

## 💰 免费层级限制

**Render 免费层级包括**：
- ✅ 750 小时/月的运行时间
- ✅ 自动休眠（15分钟无活动后）
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ✅ 自动 SSL 证书
- ✅ 全球 CDN

**注意事项**：
- 🔄 服务会在不活跃时休眠，首次访问可能需要几秒钟唤醒
- 📊 每月有使用时间限制，但对于个人项目通常足够

## 🎉 部署完成

恭喜！您已成功将后端部署到 Render.com。

**下一步**：
1. ✅ 测试所有 API 端点
2. ✅ 更新前端配置
3. ✅ 配置 Supabase CORS 设置
4. ✅ 测试完整的用户流程

**有问题？**
- 📖 查看 Render 官方文档
- 🔍 检查部署日志
- 💬 在项目 Issues 中提问

---

**🎊 部署成功！您的记账本应用现在运行在免费的 Render 平台上！**