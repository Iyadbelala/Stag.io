import { Router, Request, Response } from 'express';
import {
  registerStudent,
  registerCompany,
  registerUniversity,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
} from '../../context/auth.service';
import type { AuthResponse } from '../../context/auth.service';
import { uploadDocument } from '../middleware/upload.middleware';
import { authLimiter, otpLimiter } from '../middleware/rate-limit.middleware';
import { verifyTurnstile } from '../middleware/turnstile.middleware';
import { blacklistToken } from '../../lib/token-blacklist';
import jwt from 'jsonwebtoken';

const authRouter = Router();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/** Safe error handler — never leaks internal details for 500 errors */
function handleError(res: Response, err: unknown) {
  const e = err as { code?: string; status?: number; message: string };
  const status = e.status ?? 500;
  res.status(status).json({
    success: false,
    error: {
      code: e.code ?? 'INTERNAL_ERROR',
      message: status === 500 ? 'An unexpected error occurred' : e.message,
    },
  });
}

/** Set refresh token as httpOnly cookie and strip it from the response body */
function sendAuthResponse(res: Response, result: AuthResponse, status = 200) {
  if ('refreshToken' in result && result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    const { refreshToken, ...body } = result;
    res.status(status).json({ success: true, data: body });
  } else {
    res.status(status).json({ success: true, data: result });
  }
}

/* POST /api/auth/register */
authRouter.post('/register', authLimiter, verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, university } = req.body;

  if (!email || !password || !firstName || !lastName || !university) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'All fields are required' },
    });
    return;
  }

  try {
    const result = await registerStudent({ email, password, firstName, lastName, university });
    sendAuthResponse(res, result, 201);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/login */
authRouter.post('/login', authLimiter, verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
    });
    return;
  }

  try {
    const result = await loginUser({ email, password });
    sendAuthResponse(res, result);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/register/company */
authRouter.post('/register/company', authLimiter, uploadDocument.single('verificationDocument'), verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password, companyName, contactPerson, industry, location } = req.body;

  if (!email || !password || !companyName) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email, password, and company name are required' },
    });
    return;
  }

  const verificationDocumentUrl = req.file
    ? `/uploads/${req.file.filename}`
    : undefined;

  try {
    const result = await registerCompany({ email, password, companyName, contactPerson, industry, location, verificationDocumentUrl });
    sendAuthResponse(res, result, 201);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/register/university */
authRouter.post('/register/university', authLimiter, verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password, universityName, domain, website, location } = req.body;

  if (!email || !password || !universityName || !domain) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email, password, university name, and domain are required' },
    });
    return;
  }

  try {
    const result = await registerUniversity({ email, password, universityName, domain, website, location });
    sendAuthResponse(res, result, 201);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/verify-email */
authRouter.post('/verify-email', otpLimiter, async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email and verification code are required' },
    });
    return;
  }

  try {
    const result = await verifyEmail(email, code);
    sendAuthResponse(res, result);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/resend-verification */
authRouter.post('/resend-verification', authLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email is required' },
    });
    return;
  }

  try {
    await resendVerificationCode(email);
    // Always return success to prevent email enumeration
    res.status(200).json({ success: true, data: { message: 'If the email exists, a verification code has been sent' } });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/forgot-password */
authRouter.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email is required' },
    });
    return;
  }

  try {
    await requestPasswordReset(email);
    res.status(200).json({ success: true, data: { message: 'If an account exists, a reset link has been sent' } });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/reset-password */
authRouter.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Token and new password are required' },
    });
    return;
  }

  try {
    await resetPassword(token, password);
    res.status(200).json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/refresh */
authRouter.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is required' },
    });
    return;
  }

  try {
    const result = await refreshAccessToken(token);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { token: result.accessToken } });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/auth/logout */
authRouter.post('/logout', (req: Request, res: Response) => {
  // Blacklist the current access token so it can't be reused
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        blacklistToken(token, decoded.exp);
      }
    } catch {
      // Token is already invalid — nothing to blacklist
    }
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json({ success: true, data: { message: 'Logged out' } });
});

export default authRouter;
