import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { toggleSavedOffer, getSavedOfferIds } from '../../context/saved.service';

const savedRouter = Router();

/* POST /api/saved/:offerId — toggle save/unsave */
savedRouter.post('/:offerId', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await toggleSavedOffer(req.user!.sub, req.params.offerId as string);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/saved — list saved offer IDs */
savedRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const ids = await getSavedOfferIds(req.user!.sub);
    res.json({ success: true, data: ids });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default savedRouter;
