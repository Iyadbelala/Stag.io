import { Router } from 'express';
import authRouter from './auth.routes';
import profileRouter from './profile.routes';
import companyProfileRouter from './company-profile.routes';
import companiesRouter from './companies.routes';
import offersRouter from './offers.routes';
import applicationsRouter from './applications.routes';
import adminRouter from './admin.routes';
import superadminRouter from './superadmin.routes';

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

// Company routes (authenticated)
router.use('/company', companyProfileRouter);

// Public companies listing
router.use('/companies', companiesRouter);

// Internship offers
router.use('/offers', offersRouter);

// Applications
router.use('/applications', applicationsRouter);

// Admin
router.use('/admin', adminRouter);

// Super Admin
router.use('/superadmin', superadminRouter);
