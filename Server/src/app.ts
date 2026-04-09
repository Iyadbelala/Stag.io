import express, { Request, Response, NextFunction } from 'express';
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

/* ── 404 Handler — Unknown routes ── */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist' },
  });
});

/* ── Global Error Handler — Catches all unhandled errors ── */
app.use((err: Error & { status?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  // Log the error for debugging (visible in server console)
  console.error(`[ERROR] ${err.code ?? 'UNKNOWN'}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code (use error's status if set, otherwise 500)
  const status = err.status ?? 500;

  // Send clean JSON response — never leak stack traces in production
  res.status(status).json({
    success: false,
    error: {
      code: err.code ?? 'SERVER_ERROR',
      message: status === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'   // Hide details in production
        : err.message,                      // Show details in development
    },
  });
});

export default app;
