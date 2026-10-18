import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import { giftRouter } from './routes/giftRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (useful for production deployment)
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
      // Allow requests with no origin (like mobile apps or curl) or if in allowedOrigins
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

// Rate limiters to prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const createGiftLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Max 30 gift creations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Bạn đã tạo quá nhiều món quà trong một giờ qua. Vui lòng thử lại sau.' },
});

// Mount Routes
app.use('/api', apiLimiter);
app.use('/api/gifts', giftRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'database_disconnected',
    database: isDbConnected ? 'MongoDB Atlas Connected' : 'Disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ.',
  });
});

// Start Server & Connect MongoDB Atlas
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Love Sketchbook Backend running at http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error('[Server] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
