import { Request, Response, NextFunction } from 'express';

/**
 * Double-submit CSRF protection using a custom header.
 *
 * Since browsers won't send custom headers on cross-origin requests without CORS,
 * requiring `X-Requested-With` on all state-changing requests blocks CSRF attacks
 * even if sameSite cookies are somehow bypassed.
 *
 * Only enforced on non-GET/HEAD/OPTIONS methods (state-changing requests).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const header = req.headers['x-requested-with'];
  if (header !== 'XMLHttpRequest') {
    res.status(403).json({
      success: false,
      error: { code: 'CSRF_REJECTED', message: 'Missing or invalid CSRF header' },
    });
    return;
  }

  next();
}
