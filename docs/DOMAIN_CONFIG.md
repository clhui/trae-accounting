# 域名配置摘要

## 用户提供的域名信息

- **后端域名**: `backgroud.lanbito.asia`
- **前端域名**: `jizhang.lanbito.asia`

## 已完成的配置更新

### 1. 前端配置更新

✅ **已更新文件**: `.env.production`
```env
# 后端 API URL - 用户提供的后端域名
VITE_API_URL=https://backgroud.lanbito.asia/api
```

### 2. 前端部署配置

前端应用将部署到用户提供的域名：`jizhang.lanbito.asia`

## 待完成的配置

### 1. 后端部署

需要将后端部署到 `backgroud.lanbito.asia`，可以选择以下平台：
- **推荐**: Render.com（免费）
- 其他选项：Vercel、Railway、Netlify Functions

### 2. Supabase CORS 配置

需要在 Supabase 项目中添加以下域名到允许列表：
- `https://jizhang.lanbito.asia` （前端域名）
- `https://backgroud.lanbito.asia` （后端域名）

**配置步骤**：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目
3. 进入 Authentication > Settings
4. 在 "Site URL" 中设置：`https://jizhang.lanbito.asia`
5. 在 "Additional URLs" 中添加：
   - `https://jizhang.lanbito.asia`
   - `https://backgroud.lanbito.asia`

### 3. 后端环境变量配置

部署后端时需要设置以下环境变量：
```env
# 服务器配置
PORT=3002
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Supabase 配置
SUPABASE_URL=https://avftnsekomqkfeaiykad.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS 配置
FRONTEND_URL=https://jizhang.lanbito.asia
```

## 部署验证清单

### 后端验证
- [ ] 健康检查：`https://backgroud.lanbito.asia/api/health`
- [ ] 用户注册：`POST https://backgroud.lanbito.asia/api/auth/signup`
- [ ] 用户登录：`POST https://backgroud.lanbito.asia/api/auth/signin`

### 前端验证
- [ ] 访问应用：`https://jizhang.lanbito.asia`
- [ ] 测试用户注册/登录功能
- [ ] 测试记录添加/查看功能
- [ ] 测试数据同步功能

### 集成验证
- [ ] 前端能正常调用后端 API
- [ ] Supabase 认证功能正常
- [ ] 数据同步功能正常
- [ ] CORS 配置正确

## 下一步操作

1. **部署后端**：按照 `RENDER_DEPLOY.md` 指南部署到 Render.com
2. **配置域名**：将 `backgroud.lanbito.asia` 指向部署的后端服务
3. **部署前端**：将前端部署到 `jizhang.lanbito.asia`
4. **更新 Supabase**：配置 CORS 设置
5. **测试验证**：完整测试所有功能

## 注意事项

- 确保域名 DNS 配置正确指向部署的服务
- 后端需要支持 HTTPS（推荐使用免费的 Let's Encrypt 证书）
- 前端构建时会使用 `.env.production` 中的配置
- 所有敏感信息（如 JWT_SECRET、Supabase 密钥）应通过环境变量配置，不要硬编码在代码中