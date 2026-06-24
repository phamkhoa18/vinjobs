import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import AppError from './src/utils/AppError.js';
import { globalErrorHandler } from './src/middlewares/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import cvRoutes from './src/routes/cvRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import settingRoutes from './src/routes/settingRoutes.js';
import savedJobRoutes from './src/routes/savedJobRoutes.js';

const app = express();

// 1. GLOBAL MIDDLEWARES
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - allow frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Cấu hình folder chứa ảnh tĩnh (cần thiết để frontend truy cập được file)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate Limiting
// const limiter = rateLimit({
//   max: 200, // limit each IP to 200 requests per windowMs
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau một giờ!',
// });
// app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'VinJobs API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/cvs', cvRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/saved-jobs', savedJobRoutes);

// 3. 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} không tồn tại trên server này!`, 404));
});

// 4. GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

export default app;
