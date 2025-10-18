import { Router } from 'express';
import { db, User } from '../database/init';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { emailService, VerificationCodeService } from '../services/email';
import { redisService } from '../services/redis';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'coldaw-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token 有效期 7 天
const SALT_ROUNDS = 10;

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/send-verification
 * Send verification code to email
 */
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists (allow test user to register multiple times)
    const testEmail = 'deng1876888691@gmail.com';
    const existingUser = await db.getUserByEmail(email);
    if (existingUser && email !== testEmail) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // 注释掉频繁操作限制，允许用户随时重新发送验证码
    // Check if verification code already exists and is still valid
    // const existingCodeTTL = await VerificationCodeService.getTTL(email);
    // if (existingCodeTTL > 0) {
    //   const remainingMinutes = Math.ceil(existingCodeTTL / 60);
    //   return res.status(429).json({ 
    //     error: `Verification code already sent. Please wait ${remainingMinutes} minutes before requesting a new one.` 
    //   });
    // }

    // Generate and store verification code
    const code = await VerificationCodeService.generateAndStore(email);

    // Send verification email
    try {
      await emailService.sendVerificationCode(email, code);
      res.json({ message: 'Verification code sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // 如果邮件发送失败，在开发环境中仍然可以在控制台看到验证码
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode - Verification code for ${email}: ${code}`);
        res.json({ message: 'Verification code generated (check console in development mode)' });
      } else {
        res.status(500).json({ error: 'Failed to send verification email' });
      }
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register
 * Register a new user account with verification code
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, verificationCode } = req.body;

    if (!email || !password || !verificationCode) {
      return res.status(400).json({ error: 'Email, password, and verification code are required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify the verification code using Redis
    const isCodeValid = await VerificationCodeService.verify(email, verificationCode);
    if (!isCodeValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Check if user already exists (allow test user to re-register)
    const testEmail = 'deng1876888691@gmail.com';
    const existingUser = await db.getUserByEmail(email);
    if (existingUser && email !== testEmail) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // For test email, delete existing user if exists
    if (existingUser && email === testEmail) {
      await db.deleteUser(existingUser.id);
      console.log(`🧪 Test user ${testEmail} deleted and will be re-created`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      username: email.split('@')[0], // Generate username from email
      name: name || email.split('@')[0],
      created_at: Date.now(),
    };

    await db.insertUser(newUser);

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Return token and user info (don't send password)
    res.json({
      token,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user from database
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return token and user info
    res.json({
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate token
 */
router.post('/logout', async (req, res) => {
  try {
    // JWT is stateless, client removes token
    // If you need true revocation, maintain a blacklist
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/verify
 * Verify if a token is valid
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const user = await db.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Middleware to verify authentication
 * Use this in other routes that require authentication
 */
export async function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Get user info
    const user = await db.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user_id = decoded.userId; // Use user_id to match other routes
    req.userId = decoded.userId; // Keep both for compatibility
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;
