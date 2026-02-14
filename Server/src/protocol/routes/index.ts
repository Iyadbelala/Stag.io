import { Router } from 'express';

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

// Route imports will go here as you build them:
// import authRoutes from './auth.routes';
// router.use('/auth', authRoutes);
