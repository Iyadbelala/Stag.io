import { Router, Request, Response } from 'express';
import { searchStudents } from '../../context/search.service';

const searchRouter = Router();

/* GET /api/search/users?q=name&limit=6 — public student search */
searchRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);

    if (q.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const results = await searchStudents(q, limit);
    res.json({ success: true, data: results });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default searchRouter;
