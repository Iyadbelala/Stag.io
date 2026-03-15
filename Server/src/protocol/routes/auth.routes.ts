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
} from '../../context/auth.service';
import { uploadDocument } from '../middleware/upload.middleware';

const authRouter = Router();

/* POST /api/auth/register */
authRouter.post('/register', async (req: Request, res: Response) => {
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
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/login */
authRouter.post('/login', async (req: Request, res: Response) => {
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
    res.status(200).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/register/company */
authRouter.post('/register/company', uploadDocument.single('verificationDocument'), async (req: Request, res: Response) => {
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
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/register/university */
authRouter.post('/register/university', async (req: Request, res: Response) => {
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
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/verify-email */
authRouter.post('/verify-email', async (req: Request, res: Response) => {
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
    res.status(200).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/resend-verification */
authRouter.post('/resend-verification', async (req: Request, res: Response) => {
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
    res.status(200).json({ success: true, data: { message: 'Verification code sent' } });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/forgot-password */
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
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
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/reset-password */
authRouter.post('/reset-password', async (req: Request, res: Response) => {
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
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default authRouter;
