import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './protocol/routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Stag.io API is healthy ☕',
    timestamp: new Date().toISOString(),
  });
});

export default app;
