import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadMemory, validateFileBytes } from '../middleware/upload.middleware';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { createOffer, getCompanyOffers, deleteOffer, updateOffer, listPublicOffers } from '../../context/offers.service';

const offersRouter = Router();

/** Safe error handler */
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

/* GET /api/offers — public list of active internships */
offersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const offers = await listPublicOffers();
    res.json({ success: true, data: offers });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* GET /api/offers/mine — company's own offers */
offersRouter.get('/mine', requireAuth, requireRole('company'), async (req: Request, res: Response) => {
  try {
    const offers = await getCompanyOffers(req.user!.sub);
    res.json({ success: true, data: offers });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* POST /api/offers — create a new internship offer (with optional banner image) */
offersRouter.post('/', requireAuth, requireRole('company'), uploadMemory.single('banner'), validateFileBytes, async (req: Request, res: Response) => {
  const { title, description, requirements, duration, location, type } = req.body;

  if (!title || !description || !requirements || !duration || !location) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Title, description, requirements, duration, and location are required' },
    });
    return;
  }

  try {
    let bannerUrl: string | undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'stag-io/offer-banners');
      bannerUrl = result.url;
    }

    const offer = await createOffer(req.user!.sub, {
      title, description, requirements, duration, location,
      type: type || 'onsite',
      bannerUrl,
    });
    res.status(201).json({ success: true, data: offer });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* PUT /api/offers/:id — update an offer (with optional banner image) */
offersRouter.put('/:id', requireAuth, requireRole('company'), uploadMemory.single('banner'), validateFileBytes, async (req: Request, res: Response) => {
  try {
    let bannerUrl: string | undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'stag-io/offer-banners');
      bannerUrl = result.url;
    }

    // Only pass allowed fields (prevent mass assignment)
    const { title, description, requirements, duration, location, type } = req.body;
    const updates: Record<string, string> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (requirements !== undefined) updates.requirements = requirements;
    if (duration !== undefined) updates.duration = duration;
    if (location !== undefined) updates.location = location;
    if (type !== undefined) updates.type = type;
    if (bannerUrl) updates.bannerUrl = bannerUrl;

    const offer = await updateOffer(req.user!.sub, req.params.id as string, updates);
    res.json({ success: true, data: offer });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* DELETE /api/offers/:id — delete an offer */
offersRouter.delete('/:id', requireAuth, requireRole('company'), async (req: Request, res: Response) => {
  try {
    await deleteOffer(req.user!.sub, req.params.id as string);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

export default offersRouter;
