import { Router } from 'express';
import authRouter from './auth.routes';
import profileRouter from './profile.routes';

export const router = Router();

// Health endpoint for the API
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Stag.io API',
    version: '0.1.0',
    endpoints: {
      health: 'GET /health',
      auth: '/api/auth/*',
      students: '/api/students/*',
      companies: '/api/companies/*',
      offers: '/api/offers/*',
      applications: '/api/applications/*',
      admin: '/api/admin/*',
    },
  });
});

// Auth routes
router.use('/auth', authRouter);

// Profile routes
router.use('/profile', profileRouter);
