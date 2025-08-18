# 后端部署配置指南

## 部署平台选择

推荐的部署平台：
- **Vercel** - 简单易用，支持 Node.js
- **Railway** - 专为后端服务设计
- **Render** - 免费层支持
- **Heroku** - 成熟的 PaaS 平台

## 环境变量配置

### 必需的环境变量

```env
# 服务器配置
PORT=3002
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS 配置
FRONTEND_URL=https://your-frontend-domain.com
```

### 安全注意事项

⚠️ **重要安全配置**：
1. **JWT_SECRET**: 必须是强密码，至少32个字符
2. **SUPABASE_SERVICE_ROLE_KEY**: 使用 service_role 密钥，不是 anon 密钥
3. **FRONTEND_URL**: 设置为实际的前端域名，确保 CORS 安全

## Vercel 部署

### 1. 创建 vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. 部署步骤

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 3. 环境变量设置

在 Vercel Dashboard 中设置环境变量：
1. 进入项目设置
2. 添加所有必需的环境变量
3. 重新部署

## Railway 部署

### 1. 创建 railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health"
  }
}
```

### 2. 部署步骤

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 健康检查端点

已在后端添加健康检查端点：

```typescript
// GET /api/health
{
  "status": "ok",
  "timestamp": "2025-01-18T10:30:00.000Z",
  "environment": "production"
}
```

## 生产环境优化

### 1. 性能优化

- 启用 gzip 压缩
- 设置适当的缓存头
- 使用连接池管理数据库连接

### 2. 监控和日志

- 集成错误监控（如 Sentry）
- 设置日志级别
- 监控 API 响应时间

### 3. 安全加固

- 启用 HTTPS
- 设置安全头
- 限制请求频率
- 验证输入数据

## 数据库迁移

确保 Supabase 数据库已创建必要的表：

```sql
-- 参考 ../CLOUD_SETUP.md 中的 SQL 脚本
-- 创建 users, records, categories, accounts 表
-- 设置行级安全策略
-- 创建必要的索引
```

## 部署检查清单

- [ ] 环境变量已正确设置
- [ ] Supabase 数据库表已创建
- [ ] JWT 密钥已更新为生产环境密钥
- [ ] CORS 配置指向正确的前端域名
- [ ] 健康检查端点正常响应
- [ ] API 端点测试通过
- [ ] 错误监控已配置
- [ ] 日志记录正常工作

## 故障排除

### 常见问题

1. **CORS 错误**: 检查 FRONTEND_URL 环境变量
2. **数据库连接失败**: 验证 Supabase 配置
3. **JWT 验证失败**: 确认 JWT_SECRET 一致性
4. **权限错误**: 检查是否使用 service_role 密钥

### 调试命令

```bash
# 检查环境变量
echo $SUPABASE_URL
echo $JWT_SECRET

# 测试 API 端点
curl https://your-api-domain.com/api/health

# 测试认证
curl -X POST https://your-api-domain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```