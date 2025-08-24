# 邮件服务配置指南

本应用支持通过SMTP发送密码重置邮件。如果不配置邮件服务，密码重置功能仍然可以工作，但重置链接将只在服务器控制台输出。

## 配置步骤

### 1. 获取SMTP服务

推荐的免费SMTP服务提供商：

#### Gmail (推荐)
- **SMTP服务器**: smtp.gmail.com
- **端口**: 587
- **用户名**: 你的Gmail邮箱地址
- **密码**: 应用专用密码（不是Gmail登录密码）

**获取Gmail应用专用密码：**
1. 登录Gmail账户
2. 进入 Google 账户设置
3. 选择「安全性」
4. 启用「两步验证」（如果尚未启用）
5. 在「两步验证」下找到「应用专用密码」
6. 生成新的应用专用密码
7. 使用生成的16位密码作为SMTP_PASS

#### QQ邮箱
- **SMTP服务器**: smtp.qq.com
- **端口**: 587
- **用户名**: 你的QQ邮箱地址
- **密码**: 授权码（不是QQ密码）

**获取QQ邮箱授权码：**
1. 登录QQ邮箱
2. 进入「设置」→「账户」
3. 开启「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务」
4. 获取授权码

#### 163邮箱
- **SMTP服务器**: smtp.163.com
- **端口**: 587
- **用户名**: 你的163邮箱地址
- **密码**: 授权码

### 2. 配置环境变量

在 `backend/.env` 文件中更新以下配置：

```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**示例配置（Gmail）：**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myapp@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### 3. 重启服务

配置完成后，重启后端服务：

```bash
npm run dev
```

如果配置正确，你会看到：
```
Email service initialized successfully
```

如果配置有误，会显示：
```
SMTP configuration not found or incomplete. Email service will be disabled.
```

### 4. 测试邮件服务

可以通过以下方式测试邮件服务是否正常工作：

1. 在前端应用中使用「忘记密码」功能
2. 检查服务器控制台日志
3. 查看目标邮箱是否收到密码重置邮件

## 常见问题

### Q: 邮件发送失败，显示认证错误
A: 请确认：
- 使用的是应用专用密码，不是邮箱登录密码
- SMTP用户名是完整的邮箱地址
- 邮箱服务商已开启SMTP服务

### Q: 邮件发送成功但收不到邮件
A: 请检查：
- 垃圾邮件文件夹
- 邮件服务商的发送限制
- 收件人邮箱地址是否正确

### Q: 如何自定义邮件模板
A: 邮件模板在 `backend/src/services/email.ts` 文件的 `sendPasswordResetEmail` 方法中定义，可以根据需要修改HTML和文本内容。

### Q: 生产环境部署注意事项
A: 
- 确保在生产环境的 `.env.production` 文件中配置正确的SMTP信息
- 使用专用的邮件服务账户，不要使用个人邮箱
- 考虑使用专业的邮件服务提供商（如SendGrid、Mailgun等）
- 设置合适的邮件发送频率限制

## 安全建议

1. **不要在代码中硬编码邮箱密码**
2. **使用应用专用密码，不要使用主密码**
3. **定期更换SMTP密码**
4. **在生产环境中使用专业邮件服务**
5. **监控邮件发送日志，防止滥用**

## 高级配置

如果需要使用其他邮件服务提供商或自定义SMTP设置，可以修改 `backend/src/services/email.ts` 文件中的传输器配置。

支持的配置选项包括：
- `host`: SMTP服务器地址
- `port`: SMTP端口（通常为587或465）
- `secure`: 是否使用SSL（465端口时为true）
- `auth.user`: SMTP用户名
- `auth.pass`: SMTP密码
- `tls.rejectUnauthorized`: 是否验证SSL证书