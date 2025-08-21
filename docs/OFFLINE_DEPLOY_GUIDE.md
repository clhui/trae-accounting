# 离线部署指南

## 当前状态

✅ **本地准备完成**
- 所有代码已提交到本地仓库
- 本地仓库领先远程仓库 2 个提交
- 自动化部署脚本已创建
- 前端配置已更新

❌ **网络连接问题**
- GitHub 返回 502 错误
- 无法推送到远程仓库
- 需要等待网络恢复

## 解决方案

### 方案一：等待网络恢复后自动推送

当网络恢复后，执行以下任一命令：

```powershell
# 使用自动化脚本（推荐）
.\deploy-render.ps1

# 或手动推送
git push origin main
```

### 方案二：使用其他网络环境

1. **移动热点**：使用手机热点连接
2. **VPN**：尝试使用 VPN 服务
3. **代理**：配置 Git 代理

```bash
# 配置 Git 代理（如果有代理服务器）
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 推送完成后移除代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方案三：直接在 Render 上部署（无需 GitHub）

如果 GitHub 持续无法访问，可以直接上传代码到 Render：

1. **压缩项目文件**
   ```powershell
   # 创建项目压缩包（排除 node_modules）
   Compress-Archive -Path .\backend\* -DestinationPath .\backend-deploy.zip
   ```

2. **Render 手动部署**
   - 访问 [Render Dashboard](https://dashboard.render.com/)
   - 选择 "Deploy from Git" 或 "Upload Files"
   - 上传 `backend-deploy.zip`
   - 配置构建和启动命令

## 部署配置信息

### 环境变量
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://avftnsekomqkfeaiykad.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://jizhang.lanbito.asia
```

### 构建配置
```yaml
# render.yaml 已创建在 backend 目录
name: trae-accounting-backend
type: web
env: node
region: singapore
plan: free
buildCommand: npm install && npm run build
startCommand: npm start
```

### 域名配置
- **后端域名**: `backgroud.lanbito.asia`
- **前端域名**: `jizhang.lanbito.asia`
- **前端 API 配置**: 已更新为指向后端域名

## 网络恢复后的操作步骤

1. **推送代码**
   ```powershell
   git push origin main
   ```

2. **验证推送**
   ```powershell
   git status
   # 应显示：Your branch is up to date with 'origin/main'
   ```

3. **开始 Render 部署**
   - 访问 [Render Dashboard](https://dashboard.render.com/)
   - 创建新的 Web Service
   - 连接 GitHub 仓库
   - 选择 `backend` 目录
   - 配置环境变量
   - 开始部署

4. **配置自定义域名**
   - 在 Render 服务设置中添加 `backgroud.lanbito.asia`
   - 更新 DNS 记录指向 Render 提供的地址

5. **测试部署**
   ```bash
   # 测试 API 可访问性
   curl https://backgroud.lanbito.asia/api/health
   ```

## 故障排除

### 常见网络问题
- **502 Bad Gateway**: 服务器临时不可用，稍后重试
- **连接超时**: 检查网络连接和防火墙设置
- **DNS 解析失败**: 尝试使用不同的 DNS 服务器

### Git 推送问题
```bash
# 检查远程仓库配置
git remote -v

# 重新设置远程仓库（如果需要）
git remote set-url origin https://github.com/clhui/trae-accounting.git

# 强制推送（谨慎使用）
git push --force-with-lease origin main
```

## 联系支持

如果问题持续存在：
1. 检查 [GitHub Status](https://www.githubstatus.com/)
2. 联系网络服务提供商
3. 尝试使用 GitHub Desktop 或其他 Git 客户端

---

**注意**: 所有必要的文件和配置都已准备就绪，只需要网络连接恢复即可完成部署。