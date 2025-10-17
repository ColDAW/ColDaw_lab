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

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(): Promise<void> {
    try {
      // 支持多种邮箱服务配置
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };

      this.transporter = nodemailer.createTransport(emailConfig);

      // 验证配置是否正确
      if (this.transporter) {
        await this.transporter.verify();
      }
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    const htmlTemplate = this.generateVerificationEmailHTML(code);

    const mailOptions = {
      from: {
        name: 'ColDAW',
        address: process.env.SMTP_USER || 'noreply@coldaw.com'
      },
      to: email,
      subject: 'ColDAW - Email Verification Code',
      html: htmlTemplate,
      text: `Your ColDAW verification code is: ${code}. This code will expire in 10 minutes.`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to: ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
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
            background: rgba(224, 56, 126, 0.1);
            border: 1px solid rgba(224, 56, 126, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #E0387E;
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
            color: #E0387E;
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

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service health check failed:', error);
      return false;
    }
  }
}

// 验证码管理类
export class VerificationCodeService {
  private static readonly CODE_PREFIX = 'verification_code:';
  private static readonly CODE_EXPIRY = 600; // 10 minutes in seconds

  static async generateAndStore(email: string): Promise<string> {
    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = this.CODE_PREFIX + email.toLowerCase();

    try {
      // 存储到Redis，设置10分钟过期
      await redisService.set(key, code, this.CODE_EXPIRY);
      console.log(`Generated verification code for ${email}: ${code}`);
      return code;
    } catch (error) {
      console.error('Failed to store verification code:', error);
      throw error;
    }
  }

  static async verify(email: string, code: string): Promise<boolean> {
    const key = this.CODE_PREFIX + email.toLowerCase();

    try {
      const storedCode = await redisService.get(key);
      
      if (!storedCode) {
        console.log(`No verification code found for ${email}`);
        return false;
      }

      const isValid = storedCode === code;
      
      if (isValid) {
        // 验证成功后删除验证码
        await redisService.delete(key);
        console.log(`Verification successful for ${email}`);
      } else {
        console.log(`Invalid verification code for ${email}`);
      }

      return isValid;
    } catch (error) {
      console.error('Failed to verify code:', error);
      throw error;
    }
  }

  static async exists(email: string): Promise<boolean> {
    const key = this.CODE_PREFIX + email.toLowerCase();
    try {
      return await redisService.exists(key);
    } catch (error) {
      console.error('Failed to check code existence:', error);
      return false;
    }
  }

  static async getTTL(email: string): Promise<number> {
    const key = this.CODE_PREFIX + email.toLowerCase();
    try {
      return await redisService.getTTL(key);
    } catch (error) {
      console.error('Failed to get code TTL:', error);
      return -1;
    }
  }
}

// 创建单例实例
export const emailService = new EmailService();