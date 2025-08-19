# Render 自动化部署指南

## 关于自动部署

很抱歉，由于当前网络连接问题，无法直接安装 Render CLI 工具进行完全自动化部署。但是，我可以为您提供几种自动化部署的方案：

## 方案一：GitHub 集成自动部署（推荐）

### 优势
- ✅ 完全自动化，无需手动操作
- ✅ 每次推送代码自动触发部署
- ✅ 零配置，Render 自动检测项目类型
- ✅ 支持环境变量管理

### 部署步骤

1. **确保代码已推送到 GitHub**
   ```bash
   git add .
   git commit -m "准备 Render 部署"
   git push origin main
   ```

2. **访问 Render 控制台**
   - 打开 [render.com](https://render.com)
   - 使用 GitHub 账户登录

3. **创建新的 Web Service**
   - 点击 "New +" → "Web Service"
   - 选择您的 GitHub 仓库：`clhui/trae-accounting`
   - 选择 `backend` 目录作为根目录

4. **配置服务设置**
   ```
   Name: trae-accounting-backend
   Environment: Node
   Region: Singapore (或选择离您最近的区域)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **配置环境变量**
   在 "Environment Variables" 部分添加：
   ```
   NODE_ENV=production
   PORT=3002
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long
   JWT_EXPIRES_IN=7d
   SUPABASE_URL=https://avftnsekomqkfeaiykad.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=https://jizhang.lanbito.asia
   ```

6. **开始部署**
   - 点击 "Create Web Service"
   - Render 将自动开始构建和部署

## 方案二：Render CLI 自动化（网络恢复后）

### 安装 Render CLI
```bash
# 方法1：使用 npm
npm install -g @render/cli

# 方法2：使用 curl (Linux/macOS)
curl -fsSL https://cli.render.com/install | sh

# 方法3：使用 Homebrew (macOS)
brew install render
```

### CLI 自动化脚本

创建 `deploy-render.sh` 脚本：
```bash
#!/bin/bash

# 登录 Render (需要 API Key)
render auth login --api-key $RENDER_API_KEY

# 创建服务
render services create \
  --name "trae-accounting-backend" \
  --type "web" \
  --repo "https://github.com/clhui/trae-accounting" \
  --branch "main" \
  --root-dir "backend" \
  --build-command "npm install && npm run build" \
  --start-command "npm start" \
  --env NODE_ENV=production \
  --env PORT=3002 \
  --env JWT_SECRET="your-jwt-secret" \
  --env SUPABASE_URL="https://avftnsekomqkfeaiykad.supabase.co" \
  --env SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --env FRONTEND_URL="https://jizhang.lanbito.asia"

# 触发部署
render services deploy --service-id $SERVICE_ID
```

## 方案三：Render API 自动化

### 使用 Render REST API

```javascript
// deploy-render-api.js
const axios = require('axios');

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const API_BASE = 'https://api.render.com/v1';

async function deployToRender() {
  try {
    // 创建服务
    const serviceConfig = {
      name: 'trae-accounting-backend',
      type: 'web_service',
      repo: 'https://github.com/clhui/trae-accounting',
      branch: 'main',
      rootDir: 'backend',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npm start',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '3002' },
        { key: 'JWT_SECRET', value: process.env.JWT_SECRET },
        { key: 'SUPABASE_URL', value: process.env.SUPABASE_URL },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
        { key: 'FRONTEND_URL', value: 'https://jizhang.lanbito.asia' }
      ]
    };

    const response = await axios.post(`${API_BASE}/services`, serviceConfig, {
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('服务创建成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('部署失败:', error.response?.data || error.message);
  }
}

// 运行部署
deployToRender();
```

## 自动化部署脚本

### Windows PowerShell 脚本

创建 `deploy-render.ps1`：
```powershell
# Render 自动化部署脚本

Write-Host "开始 Render 自动化部署..." -ForegroundColor Green

# 检查 Git 状态
Write-Host "检查 Git 状态..." -ForegroundColor Yellow
git status

# 推送最新代码
Write-Host "推送代码到 GitHub..." -ForegroundColor Yellow
git add .
git commit -m "自动部署到 Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "代码推送成功！" -ForegroundColor Green
    Write-Host "请访问 Render Dashboard 查看自动部署状态：" -ForegroundColor Cyan
    Write-Host "https://dashboard.render.com/" -ForegroundColor Blue
} else {
    Write-Host "代码推送失败，请检查网络连接或 Git 配置" -ForegroundColor Red
}

Write-Host "部署脚本执行完成" -ForegroundColor Green
```

### 使用方法
```bash
# 给脚本执行权限
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 运行部署脚本
.\deploy-render.ps1
```

## 部署后验证

### 自动化验证脚本

```javascript
// verify-deployment.js
const axios = require('axios');

async function verifyDeployment(baseUrl) {
  try {
    console.log('验证部署状态...');
    
    // 健康检查
    const healthResponse = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    
    // 测试认证端点
    const authResponse = await axios.post(`${baseUrl}/api/auth/signup`, {
      email: 'test@example.com',
      password: 'testpassword123',
      username: 'testuser'
    });
    console.log('✅ 认证端点正常');
    
    console.log('🎉 部署验证成功！');
  } catch (error) {
    console.error('❌ 部署验证失败:', error.message);
  }
}

// 使用您的 Render 域名
verifyDeployment('https://your-app-name.onrender.com');
```

## 监控和维护

### 自动化监控脚本

```bash
#!/bin/bash
# monitor-render.sh

APP_URL="https://your-app-name.onrender.com"
SLACK_WEBHOOK="your-slack-webhook-url"

while true; do
  if curl -f $APP_URL/api/health > /dev/null 2>&1; then
    echo "$(date): 应用运行正常"
  else
    echo "$(date): 应用异常，发送告警"
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Render 应用异常，请检查！"}' \
      $SLACK_WEBHOOK
  fi
  sleep 300  # 每5分钟检查一次
done
```

## 总结

虽然无法直接通过 CLI 进行完全自动化部署，但通过 GitHub 集成，Render 可以实现：

1. **自动触发部署**：每次推送代码自动部署
2. **零停机部署**：滚动更新，不影响服务
3. **环境变量管理**：安全的配置管理
4. **日志监控**：实时查看部署和运行日志
5. **自动扩缩容**：根据流量自动调整资源

**推荐使用方案一（GitHub 集成）**，这是最简单且最可靠的自动化部署方式。

## 下一步

1. 确保代码已推送到 GitHub
2. 访问 Render Dashboard 创建服务
3. 配置环境变量
4. 等待自动部署完成
5. 验证部署结果
6. 配置自定义域名（可选）

---

**注意**：网络恢复后，您可以安装 Render CLI 来获得更多自动化功能。