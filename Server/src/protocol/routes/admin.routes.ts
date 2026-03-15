import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getAcceptedApplications,
  getAllApplications,
  validateApplication,
  generateApplicationPdf,
} from '../../context/admin.service';

const adminRouter = Router();

/* ── Middleware: only admin/superadmin may access ── */
function requireAdmin(req: Request, res: Response, next: () => void): void {
  const allowed = ['admin', 'superadmin'];
  if (!req.user?.role || !allowed.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    });
    return;
  }
  next();
}

/* GET /api/admin/applications — list accepted applications awaiting validation */
adminRouter.get('/applications', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const apps = await getAcceptedApplications();
    res.json({ success: true, data: apps });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/admin/applications/all — list ALL applications */
adminRouter.get('/applications/all', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const apps = await getAllApplications();
    res.json({ success: true, data: apps });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/admin/applications/:id/validate — validate an accepted application */
adminRouter.patch('/applications/:id/validate', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateApplication(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/admin/applications/:id/pdf — download generated PDF */
adminRouter.get('/applications/:id/pdf', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pdfBuffer = await generateApplicationPdf(req.params.id as string);
    res.type('application/pdf');
    res.header('Content-Disposition', `attachment; filename="internship-agreement-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default adminRouter;
