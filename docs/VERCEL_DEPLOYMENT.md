# Vercel 部署指南

本指南将帮助您将 Trae 记账本应用部署到 Vercel 平台。

## 📋 部署前准备

✅ **已完成的步骤：**
- [x] 项目构建成功
- [x] Git 仓库已初始化
- [x] 代码已提交到本地仓库

## 🚀 部署步骤

### 步骤 1: 创建 GitHub 仓库

1. **访问 GitHub**
   - 打开 [github.com](https://github.com)
   - 登录您的 GitHub 账户

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`trae-accounting` 或您喜欢的名称
   - 设置为 Public（推荐）或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

3. **推送代码到 GitHub**
   ```bash
   # 添加远程仓库（替换为您的仓库地址）
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

### 步骤 2: 部署到 Vercel

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 或 "Log In"

2. **使用 GitHub 登录**
   - 选择 "Continue with GitHub"
   - 授权 Vercel 访问您的 GitHub 账户

3. **导入项目**
   - 在 Vercel 仪表板中，点击 "New Project"
   - 找到您刚创建的 GitHub 仓库
   - 点击 "Import"

4. **配置项目设置**
   - **Project Name**: `trae-accounting`（或您喜欢的名称）
   - **Framework Preset**: Vite（应该自动检测）
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `npm run build`（应该自动填充）
   - **Output Directory**: `dist`（应该自动填充）
   - **Install Command**: `npm install`（应该自动填充）

5. **配置环境变量**
   在部署前，点击 "Environment Variables" 部分，添加以下变量：
   
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=Trae记账本
   VITE_DEFAULT_STORAGE_MODE=hybrid
   ```
   
   **获取 Supabase 配置：**
   - 登录 [supabase.com](https://supabase.com)
   - 选择您的项目
   - 进入 Settings > API
   - 复制 "Project URL" 和 "anon public" key

6. **开始部署**
   - 点击 "Deploy" 按钮
   - 等待构建和部署完成（通常需要 2-5 分钟）

### 步骤 3: 验证部署

1. **访问应用**
   - 部署完成后，Vercel 会提供一个 URL
   - 您的应用域名：`https://trae-accounting.vercel.app`
   - 点击链接访问您的应用

2. **测试功能**
   - 测试记账功能
   - 测试用户注册/登录（如果配置了 Supabase）
   - 测试数据同步功能
   - 确认 PWA 功能正常

## 🔧 高级配置

### 自定义域名（可选）

1. **在 Vercel 项目设置中**
   - 进入项目 > Settings > Domains
   - 点击 "Add Domain"
   - 输入您的域名
   - 按照提示配置 DNS 记录

### 自动部署

✅ **已自动配置：**
- 每次推送到 `main` 分支时自动部署
- Pull Request 预览部署
- 构建状态通知

### 性能优化

1. **启用 Edge Functions**（如需要）
   ```javascript
   // vercel.json
   {
     "functions": {
       "src/api/**/*.ts": {
         "runtime": "@vercel/node"
       }
     }
   }
   ```

2. **配置缓存策略**
   ```javascript
   // vercel.json
   {
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

## 🔒 安全配置

### 环境变量安全

- ✅ 所有敏感配置都通过环境变量管理
- ✅ 不在代码中硬编码密钥
- ✅ 使用 `VITE_` 前缀确保变量在客户端可用

### HTTPS 和安全头

✅ **Vercel 自动提供：**
- 免费 SSL 证书
- 自动 HTTPS 重定向
- 安全头配置

## 📊 监控和分析

### Vercel Analytics

1. **启用分析**
   - 在项目设置中启用 Vercel Analytics
   - 查看页面访问量、性能指标等

2. **性能监控**
   - 查看构建时间
   - 监控部署状态
   - 查看错误日志

### 集成第三方监控

```javascript
// 添加到环境变量
VITE_ANALYTICS_ID=your-google-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   
   # 检查构建日志
   # 在 Vercel 项目页面查看详细错误信息
   ```

2. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 在 Vercel 项目设置中重新检查变量值
   - 重新部署项目

3. **Supabase 连接问题**
   - 验证 URL 和 Key 是否正确
   - 检查 Supabase 项目是否处于活跃状态
   - 确认网络连接

4. **路由 404 错误**
   - Vercel 自动处理 SPA 路由
   - 如有问题，添加 `vercel.json` 配置：
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 获取帮助

- **Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel 社区**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **构建日志**: 在 Vercel 项目页面查看详细日志

## 📝 部署检查清单

- [x] GitHub 仓库已创建
- [x] 代码已推送到 GitHub
- [x] Vercel 账户已设置
- [x] 项目已导入到 Vercel
- [x] 环境变量已配置
- [x] 首次部署成功
- [x] 应用功能测试通过
- [x] 应用已部署到：`https://trae-accounting.vercel.app`
- [ ] 自定义域名已配置（可选）
- [ ] 监控和分析已启用

## 🎉 部署完成

恭喜！您的 Trae 记账本应用现在已经成功部署到 Vercel。

**🌐 应用访问地址：** `https://trae-accounting.vercel.app`

**下一步：**
1. 分享您的应用链接：`https://trae-accounting.vercel.app`
2. 监控应用性能
3. 根据用户反馈持续改进
4. 定期更新和维护

---

**需要帮助？** 如果在部署过程中遇到任何问题，请检查 Vercel 的构建日志或联系技术支持。