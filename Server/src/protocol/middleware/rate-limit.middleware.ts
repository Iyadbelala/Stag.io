import rateLimit from 'express-rate-limit';

/** Strict limiter for login / password reset (5 requests per 15 min per IP) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Please try again in 15 minutes.' },
  },
});

/** OTP verification limiter (5 attempts per 15 min to prevent brute-force) */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many verification attempts. Please try again later.' },
  },
});

/** General API limiter (100 requests per minute) */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Please slow down.' },
  },
});
