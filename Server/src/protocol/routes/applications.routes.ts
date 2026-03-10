import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { applyToOffer, getStudentApplications, updateApplicationStatus } from '../../context/applications.service';

const applicationsRouter = Router();

/* POST /api/applications — apply to an internship */
applicationsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { offerId, coverLetter, cvUrl } = req.body;

  if (!offerId) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'offerId is required' },
    });
    return;
  }

  try {
    const application = await applyToOffer(req.user!.sub, offerId, {
      coverLetter,
      cvUrl,
    });
    res.status(201).json({ success: true, data: application });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/applications — list student's applications */
applicationsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const apps = await getStudentApplications(req.user!.sub);
    res.json({ success: true, data: apps });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/applications/:id/status — accept or reject an application */
applicationsRouter.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status || !['accepted', 'rejected'].includes(status)) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: 'Status must be "accepted" or "rejected"' },
    });
    return;
  }

  try {
    const result = await updateApplicationStatus(req.user!.sub, req.params.id as string, status);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default applicationsRouter;
