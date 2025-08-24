import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // 检查是否配置了SMTP设置
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || 
        smtpHost === 'your-smtp-host' || smtpUser === 'your-smtp-username') {
      console.warn('SMTP configuration not found or incomplete. Email service will be disabled.');
      console.warn('To enable email service, please configure SMTP settings in environment variables:');
      console.warn('- SMTP_HOST: Your SMTP server host');
      console.warn('- SMTP_PORT: Your SMTP server port (usually 587 for TLS)');
      console.warn('- SMTP_USER: Your SMTP username/email');
      console.warn('- SMTP_PASS: Your SMTP password/app password');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false // 允许自签名证书
        }
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured. Skipping email send.');
      console.log('Email would have been sent to:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.text || 'HTML content');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>密码重置</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>记账本 - 密码重置</h1>
          </div>
          <div class="content">
            <h2>您好！</h2>
            <p>我们收到了您的密码重置请求。请点击下面的按钮来重置您的密码：</p>
            
            <a href="${resetUrl}" class="button">重置密码</a>
            
            <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>安全提醒：</strong>
              <ul>
                <li>此链接将在 1 小时后过期</li>
                <li>如果您没有请求密码重置，请忽略此邮件</li>
                <li>请不要将此链接分享给他人</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>© 2024 记账本应用</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      记账本 - 密码重置
      
      您好！
      
      我们收到了您的密码重置请求。请访问以下链接来重置您的密码：
      
      ${resetUrl}
      
      安全提醒：
      - 此链接将在 1 小时后过期
      - 如果您没有请求密码重置，请忽略此邮件
      - 请不要将此链接分享给他人
      
      此邮件由系统自动发送，请勿回复。
      © 2024 记账本应用
    `;

    return await this.sendEmail({
      to: email,
      subject: '记账本 - 密码重置请求',
      html,
      text
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('SMTP connection test successful');
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }

  isEmailServiceEnabled(): boolean {
    return this.isConfigured;
  }
}

export default EmailService;