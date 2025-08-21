# 部署后配置指南

## 🎯 当前部署状态

### Railway 后端部署

你的记账本后端已准备好部署到 Railway：

- **部署方式**: Railway (国内可访问)
- **配置文件**: 已创建完成
- **构建状态**: ✅ 已构建成功

### 下一步：完成 Railway 部署

请按照以下步骤完成部署：

## 🚀 Railway 部署步骤

### 步骤 1: 部署后端到 Railway

**方法一：GitHub 集成部署（推荐）**

1. 将代码推送到 GitHub：
   ```bash
   git add .
   git commit -m "准备 Railway 部署"
   git push origin main
   ```

2. 访问 [Railway.app](https://railway.app) 并登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库，设置根目录为 `backend`
5. Railway 会自动检测并部署你的应用

**方法二：使用部署脚本**
```bash
cd backend
npm run deploy:railway:quick
```

### 步骤 2: 配置 Railway 环境变量

在 Railway Dashboard 中配置以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FRONTEND_URL=https://your-frontend-domain.com
```

**重要提示：**
- `JWT_SECRET`: 必须是至少 32 个字符的强密码
- `SUPABASE_SERVICE_ROLE_KEY`: 从 Supabase Dashboard > Settings > API 获取
- `FRONTEND_URL`: 部署前端后获得的域名

### 步骤 3: 验证后端部署

部署完成后，测试 API 是否正常工作：

```bash
# 替换为你的 Railway 应用 URL
curl https://your-app-name.up.railway.app/api/health
```

预期响应：
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 步骤 4: 部署前端应用

后端部署成功后，更新前端配置并部署：

1. **更新前端环境变量**
   
   编辑 `.env.production` 文件：
   ```env
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=记账本
   VITE_APP_VERSION=1.0.0
   ```

2. **部署前端到 Vercel**
   ```bash
   npm run deploy:vercel
   ```

### 步骤 5: 更新 CORS 配置

前端部署完成后，更新后端的 `FRONTEND_URL` 环境变量为前端的实际域名。

## 🗄️ Supabase 配置

### 获取必需的密钥

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下信息：
   - **Project URL** → `VITE_SUPABASE_URL` 和 `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 配置认证设置

1. 进入 **Authentication** > **Settings**
2. 在 **Site URL** 中设置你的前端域名
3. 在 **Additional URLs** 中添加你的后端域名

## ✅ 验证部署

### 1. 测试后端 API

访问健康检查端点：
```bash
curl https://your-railway-app.up.railway.app/api/health
```

### 2. 测试前端应用

1. 访问前端应用 URL
2. 尝试注册/登录功能
3. 测试记账功能

## 🔧 故障排除

### 常见问题

**1. API 连接失败**
- 检查 `VITE_API_URL` 是否正确
- 确认后端服务正在运行
- 检查 CORS 配置

**2. 认证失败**
- 验证 Supabase 配置
- 检查 JWT_SECRET 设置
- 确认环境变量正确

**3. 数据库连接问题**
- 检查 Supabase 连接信息
- 验证服务角色密钥
- 确认数据库表已创建

### 查看日志

**Railway 后端日志：**
- 在 Railway Dashboard 中查看应用日志
- 检查启动错误和运行时错误

**Vercel 前端日志：**
- 在 Vercel Dashboard 中查看构建和运行时日志
- 检查浏览器控制台错误

## 📞 获取帮助

如果遇到问题：
1. 查看详细部署指南：`backend/RAILWAY_DEPLOY.md`
2. 检查项目日志和错误信息
3. 验证所有环境变量配置

---

## 🎉 部署完成检查清单

- [ ] 后端成功部署到 Railway
- [ ] 环境变量配置完成
- [ ] API 健康检查通过
- [ ] 前端配置更新
- [ ] 前端部署到 Vercel
- [ ] Supabase 认证配置
- [ ] 应用功能测试通过

恭喜！你的记账本应用已成功部署！🎊