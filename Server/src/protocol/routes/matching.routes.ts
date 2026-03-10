import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getSmartMatches } from '../../context/matching.service';

const matchingRouter = Router();

/* GET /api/matching — smart internship recommendations for the logged-in student */
matchingRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== 'student') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only students can use smart matching' },
    });
    return;
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  try {
    const matches = await getSmartMatches(req.user!.sub, limit);
    res.json({ success: true, data: matches });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default matchingRouter;
