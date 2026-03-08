import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createOffer, getCompanyOffers, deleteOffer, updateOffer, listPublicOffers } from '../../context/offers.service';

const offersRouter = Router();

/* GET /api/offers — public list of active internships */
offersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const offers = await listPublicOffers();
    res.json({ success: true, data: offers });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/offers/mine — company's own offers */
offersRouter.get('/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const offers = await getCompanyOffers(req.user!.sub);
    res.json({ success: true, data: offers });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/offers — create a new internship offer */
offersRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { title, description, requirements, duration, location, type } = req.body;

  if (!title || !description || !requirements || !duration || !location) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Title, description, requirements, duration, and location are required' },
    });
    return;
  }

  try {
    const offer = await createOffer(req.user!.sub, {
      title, description, requirements, duration, location,
      type: type || 'onsite',
    });
    res.status(201).json({ success: true, data: offer });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PUT /api/offers/:id — update an offer */
offersRouter.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const offer = await updateOffer(req.user!.sub, req.params.id, req.body);
    res.json({ success: true, data: offer });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* DELETE /api/offers/:id — delete an offer */
offersRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await deleteOffer(req.user!.sub, req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default offersRouter;
