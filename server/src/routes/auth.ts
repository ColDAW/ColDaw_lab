import { Router } from 'express';
import { db, User } from '../database/init';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'coldaw-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token 有效期 7 天
const SALT_ROUNDS = 10;

// 临时存储验证码（生产环境中应使用 Redis 或数据库）
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

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

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification code
    verificationCodes.set(email.toLowerCase(), { code, expiresAt });

    // In a real application, you would send the code via email
    // For now, we'll log it to console for testing
    console.log(`Verification code for ${email}: ${code}`);

    res.json({ message: 'Verification code sent successfully' });
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

    // Verify the verification code
    const storedVerification = verificationCodes.get(email.toLowerCase());
    if (!storedVerification) {
      return res.status(400).json({ error: 'No verification code found for this email' });
    }

    if (Date.now() > storedVerification.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedVerification.code !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
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

    // Clear the verification code after successful registration
    verificationCodes.delete(email.toLowerCase());

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
