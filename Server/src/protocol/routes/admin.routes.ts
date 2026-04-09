import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getAcceptedApplications,
  getAllApplications,
  validateApplication,
  batchValidateApplications,
  exportApplicationsCsv,
  generateApplicationPdf,
} from '../../context/admin.service';
import { auditLog } from '../../lib/audit';

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

/* ── Helper: standard error response ── */
function errorResponse(res: Response, err: unknown) {
  const e = err as { code?: string; status?: number; message: string };
  res.status(e.status ?? 500).json({
    success: false,
    error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
  });
}

/* GET /api/admin/applications — list accepted applications awaiting validation */
adminRouter.get('/applications', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const apps = await getAcceptedApplications();
    res.json({ success: true, data: apps });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/admin/applications/all — list ALL applications with search/filter/pagination */
adminRouter.get('/applications/all', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await getAllApplications({
      q: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
      company: req.query.company as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/admin/applications/:id/validate — validate an accepted application */
adminRouter.patch('/applications/:id/validate', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateApplication(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'validate_application', target: req.params.id as string });
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/admin/applications/batch-validate — validate multiple applications at once */
adminRouter.patch('/applications/batch-validate', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'ids must be an array' } });
      return;
    }
    const result = await batchValidateApplications(ids);
    for (const id of result.validated) {
      auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'validate_application', target: id });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/admin/export/applications — export filtered applications as CSV */
adminRouter.get('/export/applications', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const csv = await exportApplicationsCsv({
      status: req.query.status as string | undefined,
      company: req.query.company as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    res.type('text/csv');
    res.header('Content-Disposition', 'attachment; filename="applications-export.csv"');
    res.send(csv);
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/admin/applications/:id/pdf — download generated PDF */
adminRouter.get('/applications/:id/pdf', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pdfBuffer = await generateApplicationPdf(req.params.id as string);
    res.type('application/pdf');
    res.header('Content-Disposition', `attachment; filename="internship-agreement-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    errorResponse(res, err);
  }
});

export default adminRouter;
