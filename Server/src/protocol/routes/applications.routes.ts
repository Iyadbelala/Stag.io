import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { applyToOffer, getStudentApplications, updateApplicationStatus } from '../../context/applications.service';

const applicationsRouter = Router();

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

/* POST /api/applications — apply to an internship (students only) */
applicationsRouter.post('/', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
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
    handleError(res, err);
  }
});

/* GET /api/applications — list student's applications (students only) */
applicationsRouter.get('/', requireAuth, requireRole('student'), async (req: Request, res: Response) => {
  try {
    const apps = await getStudentApplications(req.user!.sub);
    res.json({ success: true, data: apps });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* PATCH /api/applications/:id/status — accept or reject (companies only) */
applicationsRouter.patch('/:id/status', requireAuth, requireRole('company'), async (req: Request, res: Response) => {
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
    handleError(res, err);
  }
});

export default applicationsRouter;
