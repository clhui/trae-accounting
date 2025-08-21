# 部署指南

本文档提供了多种部署选项，帮助您将 Trae 记账本应用部署到生产环境。

## 🚀 快速部署选项

### 1. Vercel 部署（推荐）

**优势：**
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 免费额度充足
- 支持环境变量

**部署步骤：**

1. **准备代码仓库**
   ```bash
   # 如果还没有 Git 仓库，先初始化
   git init
   git add .
   git commit -m "Initial commit"
   
   # 推送到 GitHub/GitLab/Bitbucket
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择您的仓库
   - 点击 "Deploy"

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=Trae记账本
   VITE_DEFAULT_STORAGE_MODE=hybrid
   ```

### 2. Netlify 部署

**优势：**
- 简单易用
- 支持表单处理
- 免费 SSL
- 良好的静态站点优化

**部署步骤：**

1. **构建应用**
   ```bash
   npm run build
   ```

2. **部署到 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 拖拽 `dist` 文件夹到部署区域
   - 或连接 Git 仓库自动部署

3. **配置环境变量**
   在 Netlify 项目设置 > Environment variables 中添加相同的环境变量

### 3. GitHub Pages 部署

**优势：**
- 完全免费
- 与 GitHub 深度集成
- 适合开源项目

**部署步骤：**

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **修改 package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

**注意：** GitHub Pages 不支持环境变量，需要在构建时硬编码配置。

### 4. 自托管部署

**适用场景：**
- 需要完全控制服务器
- 企业内部部署
- 自定义域名和配置

**部署步骤：**

1. **构建应用**
   ```bash
   npm run build
   ```

2. **上传到服务器**
   将 `dist` 目录内容上传到 Web 服务器根目录

3. **配置 Web 服务器**
   
   **Nginx 配置示例：**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 启用 gzip 压缩
       gzip on;
       gzip_types text/css application/javascript application/json;
   }
   ```
   
   **Apache 配置示例：**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /path/to/dist
       
       <Directory /path/to/dist>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
           
           # SPA 路由支持
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
   </VirtualHost>
   ```

## 🔧 环境配置

### 生产环境变量

创建 `.env.production` 文件：

```env
# Supabase 生产环境配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# 应用配置
VITE_APP_NAME=Trae记账本
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_DEFAULT_STORAGE_MODE=hybrid

# 可选：分析和监控
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Supabase 生产环境配置

1. **创建生产项目**
   - 在 Supabase 控制台创建新项目
   - 或使用现有项目的生产环境

2. **配置数据库**
   - 运行数据库迁移脚本
   - 设置行级安全策略（RLS）
   - 配置用户认证规则

3. **获取生产密钥**
   - 项目设置 > API
   - 复制 Project URL 和 anon public key

## 📊 性能优化

### 构建优化

1. **代码分割**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['vue', 'vue-router', 'pinia'],
             ui: ['vant'],
             charts: ['echarts', 'vue-echarts']
           }
         }
       }
     }
   })
   ```

2. **资源压缩**
   ```bash
   # 安装压缩插件
   npm install --save-dev vite-plugin-compression
   ```

### 缓存策略

1. **静态资源缓存**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **HTML 缓存**
   ```nginx
   location / {
       add_header Cache-Control "no-cache";
   }
   ```

## 🔒 安全配置

### HTTPS 配置

1. **Let's Encrypt 免费证书**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取证书
   sudo certbot --nginx -d your-domain.com
   ```

2. **安全头配置**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
   ```

### 环境变量安全

- ❌ 不要在客户端代码中暴露敏感信息
- ✅ 使用 `VITE_` 前缀的环境变量
- ✅ 在 `.gitignore` 中排除 `.env.local` 文件
- ✅ 使用不同的密钥用于开发和生产环境

## 🚨 故障排除

### 常见问题

1. **路由 404 错误**
   - 确保服务器配置了 SPA 回退规则
   - 检查 `base` 配置是否正确

2. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 重新构建应用
   - 检查部署平台的环境变量配置

3. **Supabase 连接失败**
   - 验证 URL 和密钥是否正确
   - 检查网络连接
   - 确认 Supabase 项目状态

### 监控和日志

1. **错误监控**
   ```javascript
   // 集成 Sentry
   import * as Sentry from '@sentry/vue'
   
   Sentry.init({
     app,
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE
   })
   ```

2. **性能监控**
   ```javascript
   // 集成 Google Analytics
   import { gtag } from 'ga-gtag'
   
   gtag('config', import.meta.env.VITE_GA_ID)
   ```

## 📝 部署检查清单

- [ ] 代码已推送到版本控制系统
- [ ] 生产环境变量已配置
- [ ] Supabase 生产项目已设置
- [ ] 应用已成功构建
- [ ] 部署平台已配置
- [ ] 自定义域名已设置（如需要）
- [ ] HTTPS 已启用
- [ ] 性能优化已应用
- [ ] 错误监控已集成
- [ ] 备份策略已制定

## 🆘 获取帮助

如果在部署过程中遇到问题：

1. 检查构建日志和错误信息
2. 查看部署平台的文档
3. 确认环境变量配置
4. 测试本地生产构建
5. 联系技术支持

---

**祝您部署顺利！** 🎉