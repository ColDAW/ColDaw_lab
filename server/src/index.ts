import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import projectRoutes from './routes/project';
import versionRoutes from './routes/version';
import authRoutes from './routes/auth';
import waitlistRoutes from './routes/waitlist';
import { initDatabase } from './database/init';
import { setupSocketHandlers } from './socket/handlers';
import { redisService } from './services/redis';
import { emailService } from './services/email';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - MUST be before the catch-all route
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Health check endpoints
app.get('/api/health', async (req, res) => {
  try {
    const redisHealthy = redisService.isHealthy();
    const emailHealthy = await emailService.isHealthy();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Server is running',
      services: {
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        email: emailHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/health/db', async (req, res) => {
  try {
    // Test database connection
    const { db } = await import('./database/init');
    const start = Date.now();
    await db.getProjects(); // Simple query to test DB
    const dbTime = Date.now() - start;
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbQueryTime: `${dbTime}ms`
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error.message
    });
  }
});

// Serve static files in production - MUST be AFTER API routes
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  
  // Serve React app for any non-API routes - This is the catch-all route
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Ensure directories exist
// Use DATA_DIR environment variable for persistent storage (e.g., Railway volumes)
// Default to local directories for development
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const uploadDir = path.join(DATA_DIR, 'uploads');
const projectsDir = path.join(DATA_DIR, 'projects');

console.log('📁 Data directory:', DATA_DIR);
console.log('📤 Upload directory:', uploadDir);
console.log('📦 Projects directory:', projectsDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads directory');
}
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
  console.log('✅ Created projects directory');
}

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialization completed');
    
    // Initialize Redis
    await redisService.connect();
    console.log('✅ Redis connection established');
    
    // Initialize email service
    await emailService.initialize();
    console.log('✅ Email service initialized');
    
  } catch (error) {
    console.error('❌ Service initialization error:', error);
    // Continue server startup even if some services fail
  }
}

// Start service initialization
initializeServices();

// Setup Socket.io for real-time collaboration
setupSocketHandlers(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

httpServer.listen(PORT, () => {
  const deployTime = new Date().toISOString();
  console.log(`🚀 ColDaw server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`💾 Projects directory: ${projectsDir}`);
  console.log(`🔄 Server version: ${deployTime} (log optimization applied)`);
});

export { io };
