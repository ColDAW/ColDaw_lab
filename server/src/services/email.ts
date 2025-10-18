import nodemailer from 'nodemailer';
import { redisService } from './redis';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Mailgun API配置接口
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  region?: 'us' | 'eu';
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private useMailgunAPI: boolean = false;
  private mailgunConfig: MailgunConfig | null = null;

  async initialize(): Promise<void> {
    try {
      // 检查是否使用Mailgun API
      const mailgunApiKey = process.env.MAILGUN_API_KEY;
      const mailgunDomain = process.env.MAILGUN_DOMAIN;
      
      if (mailgunApiKey && mailgunDomain) {
        this.useMailgunAPI = true;
        this.mailgunConfig = {
          apiKey: mailgunApiKey,
          domain: mailgunDomain,
          region: (process.env.MAILGUN_REGION as 'us' | 'eu') || 'us'
        };
        console.log('🔧 Using Mailgun API for email delivery');
        console.log('✅ Email service initialized with Mailgun API');
        return;
      }

      // 调试：打印环境变量检查结果
      console.log('🔍 Email service initialization - Environment variables check:');
      console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
      console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
      console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET (***@***)' : 'NOT SET');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET (length: ' + process.env.SMTP_PASS.length + ')' : 'NOT SET');
      
      // 检查必要的环境变量
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('❌ SMTP credentials not configured. Email service will be disabled.');
        console.warn('Missing:', !process.env.SMTP_USER ? 'SMTP_USER' : '', !process.env.SMTP_PASS ? 'SMTP_PASS' : '');
        return;
      }

      // Railway平台优化的SMTP配置
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.mailgun.org',
        port: parseInt(process.env.SMTP_PORT || '2525'), // 使用2525端口，Railway更友好
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      console.log(`🔧 Initializing email service with ${emailConfig.host}:${emailConfig.port} (secure: ${emailConfig.secure})`);

      // Railway平台优化的连接选项
      const transporterOptions = {
        ...emailConfig,
        connectionTimeout: 30000,     // 30 seconds
        greetingTimeout: 30000,       // 30 seconds  
        socketTimeout: 60000,         // 60 seconds
        pool: false,                  // 禁用连接池
        maxConnections: 1,
        maxMessages: 1,               // 每个连接只发送一封邮件
        requireTLS: false,            // 不强制TLS
        ignoreTLS: false,
        tls: {
          rejectUnauthorized: false   // Railway环境可能需要这个
        }
      };

      this.transporter = nodemailer.createTransport(transporterOptions);

      // 跳过初始验证，改为延迟验证
      console.log('⚡ Email service transporter created (skipping initial verification)');
      console.log('✅ Email service initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      // 不抛出错误，让服务器继续启动
      this.transporter = null;
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    // 优先使用Mailgun API
    if (this.useMailgunAPI && this.mailgunConfig) {
      return this.sendViaMailgunAPI(email, code);
    }

    // 后备SMTP方法
    if (!this.transporter) {
      throw new Error('Email service not available - SMTP not configured');
    }

    // 在Railway生产环境跳过预验证
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔍 Verifying SMTP connection before sending...');
        const verifyPromise = this.transporter.verify();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('SMTP verification timeout')), 15000);
        });
        
        await Promise.race([verifyPromise, timeoutPromise]);
        console.log('✅ SMTP connection verified successfully');
      } catch (verifyError: any) {
        console.error('❌ SMTP verification failed:', verifyError.message);
        console.warn('⚠️ 开发环境验证失败，但继续尝试发送邮件...');
      }
    } else {
      console.log('🚀 Production mode: 跳过SMTP预验证，直接发送邮件');
    }

    const htmlTemplate = this.generateVerificationEmailHTML(code);

    const mailOptions = {
      from: {
        name: 'ColDAW',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@coldaw.app'
      },
      to: email,
      subject: 'ColDAW - Email Verification Code',
      html: htmlTemplate,
      text: `Your ColDAW verification code is: ${code}. This code will expire in 10 minutes.`
    };

    try {
      console.log(`📧 Sending verification email to: ${email}`);
      // 增加发送超时时间
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email send timeout')), 60000); // 60 seconds
      });
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ Verification email sent successfully to: ${email}`);
      console.log('Message ID:', result.messageId);
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      
      // 提供更具体的错误信息
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new Error('邮件服务器连接超时 - 请稍后重试');
      } else if (error.code === 'EAUTH') {
        throw new Error('邮箱认证失败 - 请检查SMTP凭据');
      } else if (error.message === 'Email send timeout') {
        throw new Error('邮件发送超时 - 请重新尝试');
      } else {
        throw new Error(`邮件发送失败: ${error.message}`);
      }
    }
  }

  // 新增：通过Mailgun API发送邮件
  private async sendViaMailgunAPI(email: string, code: string): Promise<void> {
    if (!this.mailgunConfig) {
      throw new Error('Mailgun API not configured');
    }

    const htmlTemplate = this.generateVerificationEmailHTML(code);
    const textTemplate = `Your ColDAW verification code is: ${code}. This code will expire in 10 minutes.`;

    const formData = new FormData();
    formData.append('from', `ColDAW <${process.env.FROM_EMAIL || 'noreply@coldaw.app'}>`);
    formData.append('to', email);
    formData.append('subject', 'ColDAW - Email Verification Code');
    formData.append('html', htmlTemplate);
    formData.append('text', textTemplate);

    const baseUrl = this.mailgunConfig.region === 'eu' 
      ? 'https://api.eu.mailgun.net/v3' 
      : 'https://api.mailgun.net/v3';
    
    const url = `${baseUrl}/${this.mailgunConfig.domain}/messages`;

    try {
      console.log(`📧 Sending verification email via Mailgun API to: ${email}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.mailgunConfig.apiKey}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as { id: string };
      console.log(`✅ Verification email sent successfully via Mailgun API to: ${email}`);
      console.log('Message ID:', result.id);
    } catch (error: any) {
      console.error('❌ Failed to send verification email via Mailgun API:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }

  private generateVerificationEmailHTML(code: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ColDAW Email Verification</title>
    <style>
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #141414 0%, #2a2a2a 100%);
            border-radius: 12px;
            border: 1px solid #404040;
            overflow: hidden;
        }
        .header {
            background: #EB5A72;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .verification-code {
            display: inline-block;
            background: #EB5A72;
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 20px 40px;
            border-radius: 12px;
            letter-spacing: 8px;
            margin: 20px 0;
            box-shadow: 0 8px 32px rgba(235, 90, 114, 0.3);
        }
        .description {
            font-size: 16px;
            color: #b0b0b0;
            line-height: 1.6;
            margin: 20px 0;
        }
        .warning {
            background: rgba(235, 90, 114, 0.1);
            border: 1px solid rgba(235, 90, 114, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #EB5A72;
        }
        .footer {
            background: #0a0a0a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #707070;
            border-top: 1px solid #2a2a2a;
        }
        .footer a {
            color: #EB5A72;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ColDAW</h1>
        </div>
        <div class="content">
            <h2 style="color: #ffffff; margin-bottom: 10px;">Email Verification</h2>
            <p class="description">
                Thank you for signing up for ColDAW! Please use the following verification code to complete your registration:
            </p>
            <div class="verification-code">${code}</div>
            <p class="description">
                Enter this code in the verification screen to activate your account and start creating amazing music projects.
            </p>
            <div class="warning">
                ⚠️ This code will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>
                This email was sent by ColDAW.<br>
                If you have any questions, please contact us at 
                <a href="mailto:support@coldaw.com">support@coldaw.com</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async isHealthy(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    // 生产环境中，如果transporter已创建且有必要的配置，就认为是健康的
    if (process.env.NODE_ENV === 'production') {
      const hasCredentials = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
      console.log('🚀 Production mode: SMTP健康检查基于配置完整性判断');
      return hasCredentials;
    }

    try {
      // 开发环境进行实际验证
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 5000);
      });
      
      await Promise.race([verifyPromise, timeoutPromise]);
      return true;
    } catch (error) {
      console.error('Email service health check failed:', error);
      // 即使验证失败，也返回true，让实际发送来测试
      return true;
    }
  }
}

// 验证码管理类
export class VerificationCodeService {
  private static readonly CODE_PREFIX = 'verification_code:';
  private static readonly CODE_EXPIRY = 600; // 10 minutes in seconds
  
  // 内存备份存储（当Redis不可用时）
  private static memoryStore = new Map<string, { code: string; expiry: number }>();

  static async generateAndStore(email: string): Promise<string> {
    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = this.CODE_PREFIX + email.toLowerCase();

    try {
      // 优先尝试存储到Redis
      if (redisService.isHealthy()) {
        await redisService.set(key, code, this.CODE_EXPIRY);
        console.log(`✅ Generated verification code for ${email}: ${code} (stored in Redis)`);
      } else {
        // Redis不可用时，使用内存存储作为备选
        const expiry = Date.now() + (this.CODE_EXPIRY * 1000);
        this.memoryStore.set(key, { code, expiry });
        console.log(`⚠️ Generated verification code for ${email}: ${code} (stored in memory - Redis unavailable)`);
      }
      return code;
    } catch (error) {
      console.error('❌ Failed to store verification code in Redis, falling back to memory:', error);
      // 即使Redis失败，也使用内存存储
      const expiry = Date.now() + (this.CODE_EXPIRY * 1000);
      this.memoryStore.set(key, { code, expiry });
      console.log(`⚠️ Generated verification code for ${email}: ${code} (fallback to memory storage)`);
      return code;
    }
  }

  static async verify(email: string, code: string): Promise<boolean> {
    const key = this.CODE_PREFIX + email.toLowerCase();

    try {
      let storedCode: string | null = null;
      
      // 优先从Redis获取
      if (redisService.isHealthy()) {
        storedCode = await redisService.get(key);
      }
      
      // 如果Redis中没有或Redis不可用，尝试内存存储
      if (!storedCode) {
        const memoryData = this.memoryStore.get(key);
        if (memoryData) {
          // 检查是否过期
          if (Date.now() < memoryData.expiry) {
            storedCode = memoryData.code;
          } else {
            // 过期则删除
            this.memoryStore.delete(key);
          }
        }
      }
      
      if (!storedCode) {
        console.log(`❌ No verification code found for ${email}`);
        return false;
      }

      const isValid = storedCode === code;
      
      if (isValid) {
        // 验证成功后删除验证码
        try {
          if (redisService.isHealthy()) {
            await redisService.delete(key);
          }
        } catch (redisError) {
          console.warn('Failed to delete code from Redis:', redisError);
        }
        this.memoryStore.delete(key); // 同时清理内存存储
        console.log(`✅ Verification successful for ${email}`);
      } else {
        console.log(`❌ Invalid verification code for ${email}`);
      }

      return isValid;
    } catch (error) {
      console.error('❌ Failed to verify code:', error);
      throw error;
    }
  }

  static async exists(email: string): Promise<boolean> {
    const key = this.CODE_PREFIX + email.toLowerCase();
    try {
      if (redisService.isHealthy()) {
        return await redisService.exists(key);
      } else {
        // 检查内存存储
        const memoryData = this.memoryStore.get(key);
        return memoryData !== undefined && Date.now() < memoryData.expiry;
      }
    } catch (error) {
      console.error('Failed to check code existence:', error);
      // 检查内存存储作为备选
      const memoryData = this.memoryStore.get(key);
      return memoryData !== undefined && Date.now() < memoryData.expiry;
    }
  }

  static async getTTL(email: string): Promise<number> {
    const key = this.CODE_PREFIX + email.toLowerCase();
    try {
      if (redisService.isHealthy()) {
        return await redisService.getTTL(key);
      } else {
        // 计算内存存储的TTL
        const memoryData = this.memoryStore.get(key);
        if (memoryData) {
          const remainingTime = Math.max(0, Math.floor((memoryData.expiry - Date.now()) / 1000));
          return remainingTime;
        }
        return -1;
      }
    } catch (error) {
      console.error('Failed to get code TTL:', error);
      // 检查内存存储作为备选
      const memoryData = this.memoryStore.get(key);
      if (memoryData) {
        const remainingTime = Math.max(0, Math.floor((memoryData.expiry - Date.now()) / 1000));
        return remainingTime;
      }
      return -1;
    }
  }
}

// 创建单例实例
export const emailService = new EmailService();