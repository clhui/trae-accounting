# Railway 部署指南

## 🚀 Railway 部署步骤

### 1. 准备工作

#### 1.1 注册 Railway 账户
- 访问 [Railway.app](https://railway.app)
- 使用 GitHub 账户登录
- 完成账户验证

#### 1.2 安装 Railway CLI（可选）
由于网络限制，可以选择以下方式之一：

**方式一：使用代理安装**
```bash
# 设置代理后安装
npm install -g @railway/cli
```

**方式二：手动下载**
- 访问 [Railway CLI Releases](https://github.com/railwayapp/cli/releases)
- 下载 `railway_windows_amd64.exe`
- 重命名为 `railway.exe` 并添加到 PATH

**方式三：使用 Web 界面（推荐）**
- 直接在 Railway 网站上操作，无需安装 CLI

### 2. 部署方法

#### 方法一：GitHub 集成部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备 Railway 部署"
   git push origin main
   ```

2. **在 Railway 创建项目**
   - 登录 Railway Dashboard
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - 选择 `backend` 目录作为根目录

3. **配置环境变量**
   在 Railway 项目设置中添加以下环境变量：
   ```
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   FRONTEND_URL=your_frontend_url
   PORT=3000
   ```

4. **部署设置**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Root Directory: `/backend`

#### 方法二：CLI 部署

如果成功安装了 Railway CLI：

1. **登录 Railway**
   ```bash
   railway login
   ```

2. **初始化项目**
   ```bash
   cd backend
   railway init
   ```

3. **设置环境变量**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your_jwt_secret
   railway variables set SUPABASE_URL=your_supabase_url
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set FRONTEND_URL=your_frontend_url
   ```

4. **部署**
   ```bash
   railway up
   ```

### 3. 配置文件说明

项目已包含以下配置文件：

- `railway.json` - Railway 部署配置
- `package.json` - 包含启动脚本
- `.env.example` - 环境变量模板

### 4. 部署后验证

1. **获取部署 URL**
   - 在 Railway Dashboard 中查看项目 URL
   - 格式通常为：`https://your-app-name.up.railway.app`

2. **测试 API**
   ```bash
   curl https://your-app-name.up.railway.app/api/health
   ```

3. **检查日志**
   - 在 Railway Dashboard 中查看部署日志
   - 确认服务正常启动

### 5. 常见问题

#### 5.1 构建失败
- 检查 `package.json` 中的 scripts
- 确保所有依赖都在 `dependencies` 中
- 检查 Node.js 版本兼容性

#### 5.2 启动失败
- 检查环境变量是否正确设置
- 确认端口配置（Railway 会自动分配 PORT）
- 查看应用日志排查错误

#### 5.3 数据库连接问题
- 确认 Supabase 配置正确
- 检查网络连接和防火墙设置

### 6. 自动部署

配置 GitHub Actions 实现自动部署：

```yaml
# .github/workflows/railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up --service ${{ secrets.RAILWAY_SERVICE_ID }}
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 7. 监控和维护

- 使用 Railway Dashboard 监控应用状态
- 设置日志告警
- 定期检查资源使用情况
- 备份重要数据

---

## 📞 支持

如果遇到问题：
1. 查看 [Railway 文档](https://docs.railway.app)
2. 检查项目日志
3. 联系技术支持

部署成功后，记得更新前端配置中的 API 基础 URL！