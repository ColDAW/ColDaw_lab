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

// Zoho Mail API configuration interface
export interface ZohoConfig {
  apiKey?: string;           // Access Token (for short-term use)
  accountId: string;
  refreshToken?: string;     // Refresh Token (recommended for production)
  clientId?: string;         // OAuth Client ID
  clientSecret?: string;     // OAuth Client Secret
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private useZohoAPI: boolean = false;
  private zohoConfig: ZohoConfig | null = null;
  private cachedAccessToken: string | null = null;  // Cached Access Token
  private tokenExpiresAt: number = 0;                // Token expiration timestamp

  async initialize(): Promise<void> {
    try {
      // Check if using ZeptoMail/Zoho API (supports Send Mail Token or OAuth Refresh Token)
      const zohoApiKey = process.env.ZOHO_API_KEY;
      const zohoAccountId = process.env.ZOHO_ACCOUNT_ID;
      const zohoRefreshToken = process.env.ZOHO_REFRESH_TOKEN;
      const zohoClientId = process.env.ZOHO_CLIENT_ID;
      const zohoClientSecret = process.env.ZOHO_CLIENT_SECRET;
      
      // Option 1: Using Refresh Token (OAuth method - recommended for production)
      if (zohoRefreshToken && zohoClientId && zohoClientSecret) {
        this.useZohoAPI = true;
        this.zohoConfig = {
          refreshToken: zohoRefreshToken,
          clientId: zohoClientId,
          clientSecret: zohoClientSecret,
          accountId: zohoAccountId || '' // accountId is optional for ZeptoMail
        };
        console.log('🔧 Using ZeptoMail/Zoho with OAuth Refresh Token (auto-refresh enabled)');
        console.log('✅ Email service initialized with ZeptoMail API (Production Mode - OAuth)');
        return;
      }
      
      // Option 2: Using Send Mail Token / API Key (recommended for ZeptoMail)
      if (zohoApiKey) {
        this.useZohoAPI = true;
        this.zohoConfig = {
          apiKey: zohoApiKey,
          accountId: zohoAccountId || '' // accountId is optional for ZeptoMail
        };
        console.log('🔧 Using ZeptoMail with Send Mail Token (recommended for ZeptoMail)');
        console.log('✅ Email service initialized with ZeptoMail API');
        return;
      }

      // Debug: Print environment variable check results
      console.log('🔍 Email service initialization - Environment variables check:');
      console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
      console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
      console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET (***@***)' : 'NOT SET');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET (length: ' + process.env.SMTP_PASS.length + ')' : 'NOT SET');
      
      // [Comment removed]
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('❌ SMTP credentials not configured. Email service will be disabled.');
        console.warn('Missing:', !process.env.SMTP_USER ? 'SMTP_USER' : '', !process.env.SMTP_PASS ? 'SMTP_PASS' : '');
        return;
      }

      // RailwayofSMTP
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.mailgun.org',
        port: parseInt(process.env.SMTP_PORT || '2525'), // [Comment removed]
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      console.log(`🔧 Initializing email service with ${emailConfig.host}:${emailConfig.port} (secure: ${emailConfig.secure})`);

      // Railwayof
      const transporterOptions = {
        ...emailConfig,
        connectionTimeout: 30000,     // 30 seconds
        greetingTimeout: 30000,       // 30 seconds  
        socketTimeout: 60000,         // 60 seconds
        pool: false,                  // [Comment removed]
        maxConnections: 1,
        maxMessages: 1,               // [Comment removed]
        requireTLS: false,            // [Comment removed]
        ignoreTLS: false,
        tls: {
          rejectUnauthorized: false   // Railway
        }
      };

      this.transporter = nodemailer.createTransport(transporterOptions);

      // [Comment removed]
      console.log('⚡ Email service transporter created (skipping initial verification)');
      console.log('✅ Email service initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      // [Comment removed]
      this.transporter = null;
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    // [Comment removed]
    if (this.useZohoAPI && this.zohoConfig) {
      return this.sendViaZohoAPI(email, code);
    }

    // [Comment removed]
    if (!this.transporter) {
      throw new Error('Email service not available - SMTP not configured');
    }

    // [Comment removed]
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
        console.warn('⚠️ ，...');
      }
    } else {
      // console.log removed;
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
      // [Comment removed]
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email send timeout')), 60000); // 60 seconds
      });
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ Verification email sent successfully to: ${email}`);
      console.log('Message ID:', result.messageId);
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      
      // [Comment removed]
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new Error("Error");
      } else if (error.code === 'EAUTH') {
        throw new Error("Error");
      } else if (error.message === 'Email send timeout') {
        throw new Error("Error");
      } else {
        throw new Error("Error");
      }
    }
  }

  // [Comment removed]
  private async getZohoAccessToken(): Promise<string> {
    if (!this.zohoConfig) {
      throw new Error('Zoho config not initialized');
    }

    // [Comment removed]
    // ZeptoMail Send Mail Token ，
    if (this.zohoConfig.apiKey) {
      console.log('🔑 Using ZeptoMail Send Mail Token / Zoho API Key');
      
      // [Comment removed]
      if (this.zohoConfig.apiKey.startsWith('Zoho-enczapikey')) {
        console.log('Token already has Zoho-enczapikey prefix');
        return this.zohoConfig.apiKey;
      }
      
      // [Comment removed]
      console.log('Token is raw, will add prefix in header');
      return this.zohoConfig.apiKey;
    }

    // [Comment removed]
    if (this.zohoConfig.refreshToken && this.zohoConfig.clientId && this.zohoConfig.clientSecret) {
      // [Comment removed]
      const now = Date.now();
      if (this.cachedAccessToken && this.tokenExpiresAt > now + 5 * 60 * 1000) {
        console.log('✅ Using cached OAuth Access Token');
        return this.cachedAccessToken;
      }

      // [Comment removed]
      try {
        console.log('🔄 Refreshing Zoho OAuth Access Token...');
        
        const formData = new URLSearchParams({
          refresh_token: this.zohoConfig.refreshToken,
          client_id: this.zohoConfig.clientId,
          client_secret: this.zohoConfig.clientSecret,
          grant_type: 'refresh_token',
        });

        const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as { 
          access_token: string; 
          expires_in: number;
        };
        
        // [Comment removed]
        this.cachedAccessToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

        console.log('✅ Zoho OAuth Access Token refreshed successfully');
        console.log(`Token expires in: ${data.expires_in || 3600} seconds`);
        
        return data.access_token;
      } catch (error: any) {
        console.error('❌ Failed to refresh Zoho OAuth Access Token:', error);
        throw new Error(`Token refresh failed: ${error.message}`);
      }
    }

    throw new Error('No valid Zoho authentication configured. Please set either ZOHO_API_KEY (Send Mail Token) or ZOHO_REFRESH_TOKEN with Client credentials.');
  }

    // [Comment removed]
  private async sendViaZohoAPI(email: string, code: string): Promise<void> {
    if (!this.zohoConfig) {
      throw new Error('Zoho Mail API not configured');
    }

    const htmlTemplate = this.generateVerificationEmailHTML(code);
    const textTemplate = `Your ColDAW verification code is: ${code}. This code will expire in 10 minutes.`;

    try {
      console.log(`📧 Sending verification email via Zoho Mail API to: ${email}`);
      
      // [Comment removed]
      const accessToken = await this.getZohoAccessToken();

      // Zoho Transactional Email API of payload 
      const payload = {
        from: {
          address: process.env.ZOHO_FROM_EMAIL || 'noreply@coldaw.app'
        },
        to: [
          {
            email_address: {
              address: email
            }
          }
        ],
        subject: 'ColDAW - Email Verification Code',
        htmlbody: htmlTemplate,
        textbody: textTemplate
      };

      // [Comment removed]
      const url = `https://api.zeptomail.com/v1.1/email`;
      
      // [Comment removed]
      // [Comment removed]
      const authHeader = accessToken.startsWith('Zoho-enczapikey') 
        ? accessToken 
        : `Zoho-enczapikey ${accessToken}`;
      
      console.log('Authorization header format:', authHeader.substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // [Comment removed]
        if (response.status === 401) {
          console.warn('⚠️ Zoho token may be expired, clearing cache and retrying...');
          this.cachedAccessToken = null;
          this.tokenExpiresAt = 0;
          
          // [Comment removed]
          const newAccessToken = await this.getZohoAccessToken();
          
          // [Comment removed]
          const retryAuthHeader = newAccessToken.startsWith('Zoho-enczapikey') 
            ? newAccessToken 
            : `Zoho-enczapikey ${newAccessToken}`;
          
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': retryAuthHeader,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            throw new Error(`Zoho Mail API error (retry): ${retryResponse.status} - ${retryErrorText}`);
          }

          const retryResult = await retryResponse.json() as { data: { message_id?: string }, message?: string };
          console.log(`✅ Verification email sent successfully via Zoho Mail API to: ${email} (after retry)`);
          if (retryResult.data?.message_id) {
            console.log('Message ID:', retryResult.data.message_id);
          }
          return;
        }

        throw new Error(`Zoho Mail API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as { data: { message_id?: string }, message?: string };
      console.log(`✅ Verification email sent successfully via Zoho Mail API to: ${email}`);
      if (result.data?.message_id) {
        console.log('Message ID:', result.data.message_id);
      }
    } catch (error: any) {
      console.error('❌ Failed to send verification email via Zoho Mail API:', error);
      throw new Error("Error");
    }
  }

  // [Comment removed]
  private async sendViaMailgunAPI(email: string, code: string): Promise<void> {
    if (!this.zohoConfig) {
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

    const baseUrl = process.env.MAILGUN_REGION === 'eu' 
      ? 'https://api.eu.mailgun.net/v3' 
      : 'https://api.mailgun.net/v3';
    
    const url = `${baseUrl}/${process.env.MAILGUN_DOMAIN}/messages`;

    try {
      console.log(`📧 Sending verification email via Mailgun API to: ${email}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
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
      throw new Error("Error");
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
            background: #2a2a2a;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        /* Multi-layer gradient effects like EditorPage create project card */
        .header::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 5%;
            width: 28%;
            height: 100%;
            background-image: linear-gradient(
                0deg,
                rgba(137, 170, 248, 0.88) 0%,
                rgba(163, 141, 250, 0.72) 18%,
                rgba(183, 112, 252, 0.58) 35%,
                rgba(197, 94, 223, 0.42) 52%,
                rgba(210, 77, 195, 0.26) 68%,
                rgba(210, 77, 195, 0.12) 82%,
                rgba(210, 77, 195, 0.04) 94%,
                rgba(210, 77, 195, 0) 100%
            );
            filter: blur(60px);
            opacity: 0.95;
            pointer-events: none;
            z-index: 1;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 25%;
            width: 32%;
            height: 110%;
            background-image: linear-gradient(
                0deg,
                rgba(183, 112, 252, 0.92) 0%,
                rgba(197, 94, 223, 0.78) 22%,
                rgba(210, 77, 195, 0.64) 40%,
                rgba(221, 81, 145, 0.48) 56%,
                rgba(232, 85, 96, 0.32) 70%,
                rgba(232, 85, 96, 0.18) 82%,
                rgba(232, 85, 96, 0.06) 92%,
                rgba(232, 85, 96, 0) 100%
            );
            filter: blur(58px);
            opacity: 0.95;
            pointer-events: none;
            z-index: 1;
        }
        
        .header-gradient-3 {
            position: absolute;
            bottom: -10px;
            left: 50%;
            width: 26%;
            height: 105%;
            background-image: linear-gradient(
                0deg,
                rgba(210, 77, 195, 0.90) 0%,
                rgba(221, 81, 145, 0.76) 20%,
                rgba(232, 85, 96, 0.62) 38%,
                rgba(235, 104, 81, 0.46) 54%,
                rgba(238, 123, 107, 0.30) 68%,
                rgba(238, 123, 107, 0.16) 80%,
                rgba(238, 123, 107, 0.05) 92%,
                rgba(238, 123, 107, 0) 100%
            );
            filter: blur(62px);
            opacity: 0.92;
            pointer-events: none;
            z-index: 1;
        }
        
        .header-gradient-4 {
            position: absolute;
            bottom: -10px;
            right: 8%;
            width: 30%;
            height: 115%;
            background-image: linear-gradient(
                0deg,
                rgba(232, 85, 96, 0.94) 0%,
                rgba(235, 104, 81, 0.80) 24%,
                rgba(238, 123, 107, 0.66) 44%,
                rgba(241, 142, 127, 0.50) 60%,
                rgba(245, 161, 147, 0.32) 74%,
                rgba(245, 161, 147, 0.16) 86%,
                rgba(245, 161, 147, 0.04) 95%,
                rgba(245, 161, 147, 0) 100%
            );
            filter: blur(56px);
            opacity: 0.9;
            pointer-events: none;
            z-index: 1;
        }
        
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .verification-code {
            display: inline-block;
            background: linear-gradient(135deg, #2a2a2a 0%, #404040 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 20px 40px;
            border-radius: 12px;
            letter-spacing: 8px;
            margin: 20px 0;
            border: 1px solid #505050;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .description {
            font-size: 16px;
            color: #b0b0b0;
            line-height: 1.6;
            margin: 20px 0;
        }
        .notice {
            background: rgba(42, 42, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #ffffff;
            position: relative;
            overflow: hidden;
        }
        
        .notice::before {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0%;
            width: 40%;
            height: 120%;
            background-image: linear-gradient(
                0deg,
                rgba(183, 112, 252, 0.4) 0%,
                rgba(197, 94, 223, 0.3) 30%,
                rgba(210, 77, 195, 0.2) 60%,
                rgba(210, 77, 195, 0) 100%
            );
            filter: blur(15px);
            opacity: 1;
            pointer-events: none;
            z-index: -1;
        }
        
        .notice::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: 0%;
            width: 40%;
            height: 110%;
            background-image: linear-gradient(
                0deg,
                rgba(232, 85, 96, 0.4) 0%,
                rgba(235, 104, 81, 0.3) 30%,
                rgba(238, 123, 107, 0.2) 60%,
                rgba(241, 142, 127, 0) 100%
            );
            filter: blur(12px);
            opacity: 1;
            pointer-events: none;
            z-index: -1;
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
            background: linear-gradient(90deg, 
                rgba(183, 112, 252, 1) 0%, 
                rgba(210, 77, 195, 1) 30%, 
                rgba(232, 85, 96, 1) 70%, 
                rgba(245, 161, 147, 1) 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-gradient-3"></div>
            <div class="header-gradient-4"></div>
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
            <div class="notice">
                This code will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.
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

    // [Comment removed]
    if (process.env.NODE_ENV === 'production') {
      const hasCredentials = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
      // console.log removed;
      return hasCredentials;
    }

    try {
      // [Comment removed]
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 5000);
      });
      
      await Promise.race([verifyPromise, timeoutPromise]);
      return true;
    } catch (error) {
      console.error('Email service health check failed:', error);
      // [Comment removed]
      return true;
    }
  }
}

// Verification code
export class VerificationCodeService {
  private static readonly CODE_PREFIX = 'verification_code:';
  private static readonly CODE_EXPIRY = 600; // 10 minutes in seconds
  
  // [Comment removed]
  private static memoryStore = new Map<string, { code: string; expiry: number }>();

  static async generateAndStore(email: string): Promise<string> {
    // [Comment removed]
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = this.CODE_PREFIX + email.toLowerCase();

    try {
      // [Comment removed]
      if (redisService.isHealthy()) {
        await redisService.set(key, code, this.CODE_EXPIRY);
        console.log(`✅ Generated verification code for ${email}: ${code} (stored in Redis)`);
      } else {
        // Redis，
        const expiry = Date.now() + (this.CODE_EXPIRY * 1000);
        this.memoryStore.set(key, { code, expiry });
        console.log(`⚠️ Generated verification code for ${email}: ${code} (stored in memory - Redis unavailable)`);
      }
      return code;
    } catch (error) {
      console.error('❌ Failed to store verification code in Redis, falling back to memory:', error);
      // [Comment removed]
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
      
      // [Comment removed]
      if (redisService.isHealthy()) {
        storedCode = await redisService.get(key);
      }
      
      // [Comment removed]
      if (!storedCode) {
        const memoryData = this.memoryStore.get(key);
        if (memoryData) {
          // [Comment removed]
          if (Date.now() < memoryData.expiry) {
            storedCode = memoryData.code;
          } else {
            // [Comment removed]
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
        // [Comment removed]
        try {
          if (redisService.isHealthy()) {
            await redisService.delete(key);
          }
        } catch (redisError) {
          console.warn('Failed to delete code from Redis:', redisError);
        }
        this.memoryStore.delete(key); // [Comment removed]
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
        // [Comment removed]
        const memoryData = this.memoryStore.get(key);
        return memoryData !== undefined && Date.now() < memoryData.expiry;
      }
    } catch (error) {
      console.error('Failed to check code existence:', error);
      // [Comment removed]
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
        // [Comment removed]
        const memoryData = this.memoryStore.get(key);
        if (memoryData) {
          const remainingTime = Math.max(0, Math.floor((memoryData.expiry - Date.now()) / 1000));
          return remainingTime;
        }
        return -1;
      }
    } catch (error) {
      console.error('Failed to get code TTL:', error);
      // [Comment removed]
      const memoryData = this.memoryStore.get(key);
      if (memoryData) {
        const remainingTime = Math.max(0, Math.floor((memoryData.expiry - Date.now()) / 1000));
        return remainingTime;
      }
      return -1;
    }
  }
}

// [Comment removed]
export const emailService = new EmailService();