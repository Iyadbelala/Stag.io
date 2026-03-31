import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './protocol/routes';

const app = express();

// Security headers
app.use(helmet());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Cookie parsing (for httpOnly refresh tokens)
app.use(cookieParser());

// Body parsing with size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Stag.io API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default app;
