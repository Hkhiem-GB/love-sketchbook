import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { giftRouter } from './routes/giftRoutes';
import { uploadRouter } from './routes/uploadRoutes';

export const app = express();

// Trust reverse proxy (standard for Vercel, Heroku, etc.)
app.set('trust proxy', 1);

// Middleware: CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or if in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/prod with public gift links
      }
    },
    credentials: true,
  })
);

// Middleware: Body parsing with reasonable limits
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Middleware: Static file serving for uploads (when Cloudinary is not used)
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Rate limiters to prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Database connection middleware for Serverless (Vercel) & Long-running runtimes
app.use(async (req, res, next) => {
  // Connect to DB for gifts or health checks
  if (
    req.path.includes('/gifts') ||
    req.path.includes('/health')
  ) {
    try {
      await connectDB();
    } catch (err: any) {
      console.error('[Database Middleware Error]:', err.message);
      return res.status(503).json({
        success: false,
        message: 'Không thể kết nối đến cơ sở dữ liệu MongoDB Atlas.',
      });
    }
  }
  next();
});

// Mount Routes on both /api/... and /... to support both local proxy and Vercel serverless rewrites
app.use('/api', apiLimiter);

app.use('/api/gifts', giftRouter);
app.use('/gifts', giftRouter);

app.use('/api/upload', uploadRouter);
app.use('/upload', uploadRouter);

// Health check endpoint
const handleHealth = (_req: express.Request, res: express.Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'database_disconnected',
    database: isDbConnected ? 'MongoDB Atlas Connected' : 'Disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ.',
  });
});

export default app;
