import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_FROM_EMAIL || 'noreply@coldaw.com',
    pass: process.env.ZOHO_API_KEY || '',
  },
});

interface WaitlistData {
  name: string;
  email: string;
  role: string;
}

// Join waitlist endpoint
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { name, email, role }: WaitlistData = req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and role',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const betaLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/editor`;

    // Email to the admin (joe.deng@coldaw.app)
    const adminEmailOptions = {
      from: process.env.ZOHO_FROM_EMAIL || 'noreply@coldaw.com',
      to: 'joe.deng@coldaw.app',
      subject: '🎵 New ColDaw Beta Waitlist Signup',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #d3d3d3; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎵 New Beta Waitlist Signup</h2>
            </div>
            <div class="content">
              <p>A new user has joined the ColDaw beta waitlist!</p>
              
              <div class="info-row">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Role:</div>
                <div class="value">${role}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Timestamp:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              ColDaw Beta Program - Automated Notification
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Email to the user (with beta link)
    const userEmailOptions = {
      from: process.env.ZOHO_FROM_EMAIL || 'noreply@coldaw.com',
      to: email,
      subject: '🎉 Welcome to ColDaw Beta!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; }
            .welcome-text { font-size: 18px; margin-bottom: 20px; }
            .beta-link { 
              display: block; 
              background: #d3d3d3; 
              color: #0a0a0a; 
              text-align: center; 
              padding: 15px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 25px 0;
              font-size: 16px;
            }
            .info-box { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border-left: 4px solid #22c55e;
            }
            .info-box h3 { margin-top: 0; color: #22c55e; }
            .footer { 
              background: #f0f0f0; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              color: #777; 
              font-size: 12px; 
            }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ColDaw Beta!</h1>
            </div>
            <div class="content">
              <p class="welcome-text">Hi ${name},</p>
              
              <p>Thank you for joining the ColDaw beta program! We're excited to have you as one of our early users.</p>
              
              <p><strong>Your Beta Access is Ready!</strong></p>
              
              <a href="${betaLink}" class="beta-link">🚀 Launch ColDaw Editor</a>
              
              <div class="info-box">
                <h3>Getting Started</h3>
                <ul>
                  <li>Click the link above to access the ColDaw editor</li>
                  <li>Create an account or sign in</li>
                  <li>Start creating your first project</li>
                  <li>Download our VST plugin to export from your DAW</li>
                </ul>
              </div>
              
              <div class="info-box">
                <h3>Need Help?</h3>
                <p>If you have any questions or feedback, don't hesitate to reach out:</p>
                <p><strong>Email:</strong> joe.deng@coldaw.app</p>
              </div>
              
              <p>We can't wait to see what you create with ColDaw!</p>
              
              <p>Best regards,<br>
              The ColDaw Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>ColDaw - Collaborative Music Production Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminEmailOptions),
      transporter.sendMail(userEmailOptions),
    ]);

    // Log to console for debugging
    console.log('Waitlist signup:', { name, email, role, timestamp: new Date().toISOString() });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the waitlist',
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process waitlist signup',
    });
  }
});

export default router;
