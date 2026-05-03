import { Request, Response, NextFunction } from 'express';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Middleware that verifies a Cloudflare Turnstile token from req.body.turnstileToken.
 * Rejects the request if the token is missing or invalid.
 */
export async function verifyTurnstile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification if Turnstile is not configured or explicitly skipped
  if (!secret || process.env.TURNSTILE_SKIP === 'true') {
    delete req.body?.turnstileToken;
    next();
    return;
  }

  const token = req.body?.turnstileToken;
  if (!token) {
    res.status(400).json({
      success: false,
      error: { code: 'CAPTCHA_REQUIRED', message: 'Please complete the security verification' },
    });
    return;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: req.ip,
      }),
    });

    const result = await response.json() as { success: boolean; 'error-codes'?: string[] };

    if (!result.success) {
      res.status(403).json({
        success: false,
        error: { code: 'CAPTCHA_FAILED', message: 'Security verification failed. Please try again.' },
      });
      return;
    }

    // Remove turnstileToken from body so it doesn't leak into service layer
    delete req.body.turnstileToken;

    next();
  } catch {
    // Fail closed in production — reject if we can't verify
    if (process.env.NODE_ENV === 'production') {
      res.status(503).json({
        success: false,
        error: { code: 'CAPTCHA_UNAVAILABLE', message: 'Security verification is temporarily unavailable. Please try again later.' },
      });
      return;
    }
    // In dev, fail open so local development isn't blocked
    delete req.body.turnstileToken;
    next();
  }
}
