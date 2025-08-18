# Supabase 后端配置指南

## 问题说明

当前后端配置使用的是 Supabase 的 `anon` 密钥，但后端 API 需要 `service_role` 密钥才能执行以下操作：
- 用户注册（创建新用户）
- 绕过行级安全策略（RLS）进行数据操作
- 管理员级别的数据库操作

## 获取 Service Role 密钥

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 在 **Project API keys** 部分找到：
   - `anon` `public` - 用于前端客户端
   - `service_role` `secret` - 用于后端服务器

## 配置步骤

1. 复制 `service_role` 密钥
2. 更新 `backend/.env` 文件中的 `SUPABASE_SERVICE_ROLE_KEY`：

```env
# 当前配置（错误 - 这是 anon 密钥）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZnRuc2Vrb21xa2ZlYWl5a2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDUyNjUsImV4cCI6MjA3MTAyMTI2NX0.n0mOmwbzczAcvRBWvcegI_QC1_9kdc8Wkjzortus4tU

# 正确配置（需要替换为真实的 service_role 密钥）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZnRuc2Vrb21xa2ZlYWl5a2FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NTI2NSwiZXhwIjoyMDcxMDIxMjY1fQ.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

## 安全注意事项

⚠️ **重要**: `service_role` 密钥具有完全的数据库访问权限，请：
- 仅在后端服务器中使用
- 不要在前端代码中暴露
- 不要提交到版本控制系统
- 在生产环境中使用环境变量管理

## 验证配置

配置完成后，重启后端服务器，然后测试用户注册功能：

```bash
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

如果配置正确，应该能成功创建用户并返回 JWT token。

## 当前状态

- ✅ 模拟认证系统已实现（用于开发测试）
- ⚠️ 需要正确的 service_role 密钥以支持真实用户注册
- ✅ 数据库表结构已定义（见 CLOUD_SETUP.md）