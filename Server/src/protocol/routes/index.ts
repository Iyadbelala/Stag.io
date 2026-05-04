import { Router } from 'express';
import { apiLimiter } from '../middleware/rate-limit.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';
import companyProfileRouter from './company-profile.routes.js';
import companiesRouter from './companies.routes.js';
import offersRouter from './offers.routes.js';
import applicationsRouter from './applications.routes.js';
import adminRouter from './admin.routes.js';
import superadminRouter from './superadmin.routes.js';
import universityRouter from './university.routes.js';
import matchingRouter from './matching.routes.js';
import searchRouter from './search.routes.js';
import chatbotRouter from './chatbot.routes.js';
import savedRouter from './saved.routes.js';
import notificationsRouter from './notifications.routes.js';
import reviewsRouter from './reviews.routes.js';
import contactRouter from './contact.routes.js';
import publicRouter from './public.routes.js';

export const router = Router();

// Global rate limit: 100 requests per minute per IP
router.use(apiLimiter);

// CSRF protection on all state-changing requests
router.use(csrfProtection);

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

// University
router.use('/university', universityRouter);

// AI Smart Matching
router.use('/matching', matchingRouter);

// Public search
router.use('/search', searchRouter);

// AI Chatbot
router.use('/chatbot', chatbotRouter);

// Saved/bookmarked offers
router.use('/saved', savedRouter);

// Notifications
router.use('/notifications', notificationsRouter);

// Reviews & Ratings
router.use('/reviews', reviewsRouter);

// Contact Form
router.use('/contact', contactRouter);

// Public unauthenticated endpoints (homepage stats, etc.)
router.use('/public', publicRouter);
