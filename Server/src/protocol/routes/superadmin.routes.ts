import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getPendingCompanies,
  validateCompany,
  rejectCompany,
  getPendingUniversities,
  validateUniversity,
  rejectUniversity,
} from '../../context/admin.service';
import {
  listUsers,
  deactivateUser,
  reactivateUser,
  listAllCompanies,
  listAllUniversities,
  listAllOffers,
  forceCloseOffer,
  deleteOffer,
  getAnalytics,
  listAuditLogs,
} from '../../context/superadmin.service';
import { count, eq } from 'drizzle-orm';
import { db } from '../../model/db';
import { users, companies, students, internshipOffers, applications, universities } from '../../model/schema';
import { auditLog } from '../../lib/audit';

const superadminRouter = Router();

/* ── Middleware: only superadmin role may access ── */
function requireSuperAdmin(req: Request, res: Response, next: () => void): void {
  if (req.user?.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Super admin access required' },
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

/* ════════════════════════════════════════════════
   STATS
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/stats — platform-wide statistics */
superadminRouter.get('/stats', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const [totalUsersRow, totalStudentsRow, totalCompaniesRow, validatedCompaniesRow, totalOffersRow, totalApplicationsRow, totalUniversitiesRow, validatedUniversitiesRow] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(students),
      db.select({ value: count() }).from(companies),
      db.select({ value: count() }).from(companies).where(eq(companies.isValidated, true)),
      db.select({ value: count() }).from(internshipOffers),
      db.select({ value: count() }).from(applications),
      db.select({ value: count() }).from(universities),
      db.select({ value: count() }).from(universities).where(eq(universities.isValidated, true)),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: totalUsersRow[0].value,
        totalStudents: totalStudentsRow[0].value,
        totalCompanies: totalCompaniesRow[0].value,
        validatedCompanies: validatedCompaniesRow[0].value,
        pendingCompanies: totalCompaniesRow[0].value - validatedCompaniesRow[0].value,
        totalOffers: totalOffersRow[0].value,
        totalApplications: totalApplicationsRow[0].value,
        totalUniversities: totalUniversitiesRow[0].value,
        validatedUniversities: validatedUniversitiesRow[0].value,
        pendingUniversities: totalUniversitiesRow[0].value - validatedUniversitiesRow[0].value,
      },
    });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/superadmin/analytics — charts data */
superadminRouter.get('/analytics', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await getAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* ════════════════════════════════════════════════
   USERS
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/users — list all users with search/filter/pagination */
superadminRouter.get('/users', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = await listUsers({
      q: req.query.q as string | undefined,
      role: req.query.role as string | undefined,
      status: req.query.status as 'active' | 'deactivated' | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/superadmin/users/:id/deactivate */
superadminRouter.patch('/users/:id/deactivate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await deactivateUser(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'deactivate_user', target: req.params.id as string });
    res.json({ success: true, data: { message: 'User deactivated' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/superadmin/users/:id/reactivate */
superadminRouter.patch('/users/:id/reactivate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await reactivateUser(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'reactivate_user', target: req.params.id as string });
    res.json({ success: true, data: { message: 'User reactivated' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* ════════════════════════════════════════════════
   COMPANIES
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/companies/all — list all companies */
superadminRouter.get('/companies/all', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = await listAllCompanies({
      q: req.query.q as string | undefined,
      validated: req.query.validated as 'true' | 'false' | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/superadmin/companies/pending — list pending companies */
superadminRouter.get('/companies/pending', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await getPendingCompanies();
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/superadmin/companies/:id/validate */
superadminRouter.patch('/companies/:id/validate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateCompany(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'validate_company', target: req.params.id as string });
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* DELETE /api/superadmin/companies/:id/reject */
superadminRouter.delete('/companies/:id/reject', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await rejectCompany(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'reject_company', target: req.params.id as string });
    res.json({ success: true, data: { message: 'Company rejected and removed' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* ════════════════════════════════════════════════
   UNIVERSITIES
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/universities/all — list all universities */
superadminRouter.get('/universities/all', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = await listAllUniversities({
      q: req.query.q as string | undefined,
      validated: req.query.validated as 'true' | 'false' | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* GET /api/superadmin/universities/pending */
superadminRouter.get('/universities/pending', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await getPendingUniversities();
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/superadmin/universities/:id/validate */
superadminRouter.patch('/universities/:id/validate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateUniversity(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'validate_university', target: req.params.id as string });
    res.json({ success: true, data: result });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* DELETE /api/superadmin/universities/:id/reject */
superadminRouter.delete('/universities/:id/reject', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await rejectUniversity(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'reject_university', target: req.params.id as string });
    res.json({ success: true, data: { message: 'University rejected and removed' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* ════════════════════════════════════════════════
   OFFERS — moderation
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/offers — list all offers */
superadminRouter.get('/offers', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = await listAllOffers({
      q: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* PATCH /api/superadmin/offers/:id/close — force-close an offer */
superadminRouter.patch('/offers/:id/close', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await forceCloseOffer(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'force_close_offer', target: req.params.id as string });
    res.json({ success: true, data: { message: 'Offer closed' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* DELETE /api/superadmin/offers/:id — remove an offer */
superadminRouter.delete('/offers/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await deleteOffer(req.params.id as string);
    auditLog({ actor: req.user!.sub, role: req.user!.role, action: 'delete_offer', target: req.params.id as string });
    res.json({ success: true, data: { message: 'Offer deleted' } });
  } catch (err) {
    errorResponse(res, err);
  }
});

/* ════════════════════════════════════════════════
   AUDIT LOG
   ════════════════════════════════════════════════ */

/* GET /api/superadmin/audit-log — list recent audit events */
superadminRouter.get('/audit-log', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = await listAuditLogs({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      action: req.query.action as string | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    errorResponse(res, err);
  }
});

export default superadminRouter;
