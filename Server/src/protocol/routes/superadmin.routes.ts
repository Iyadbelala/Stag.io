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
import { count, eq } from 'drizzle-orm';
import { db } from '../../model/db';
import { users, companies, students, internshipOffers, applications, universities } from '../../model/schema';

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

    const totalUsers = totalUsersRow[0].value;
    const totalStudents = totalStudentsRow[0].value;
    const totalCompanies = totalCompaniesRow[0].value;
    const validatedCompanies = validatedCompaniesRow[0].value;
    const totalOffers = totalOffersRow[0].value;
    const totalApplications = totalApplicationsRow[0].value;
    const totalUniversities = totalUniversitiesRow[0].value;
    const validatedUniversities = validatedUniversitiesRow[0].value;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalCompanies,
        validatedCompanies,
        pendingCompanies: totalCompanies - validatedCompanies,
        totalOffers,
        totalApplications,
        totalUniversities,
        validatedUniversities,
        pendingUniversities: totalUniversities - validatedUniversities,
      },
    });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/superadmin/companies/pending — list companies awaiting validation */
superadminRouter.get('/companies/pending', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const companies = await getPendingCompanies();
    res.json({ success: true, data: companies });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/superadmin/companies/:id/validate — validate a company */
superadminRouter.patch('/companies/:id/validate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateCompany(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* DELETE /api/superadmin/companies/:id/reject — reject & delete a company */
superadminRouter.delete('/companies/:id/reject', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await rejectCompany(req.params.id as string);
    res.json({ success: true, data: { message: 'Company rejected and removed' } });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/superadmin/universities/pending — list universities awaiting validation */
superadminRouter.get('/universities/pending', requireAuth, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const unis = await getPendingUniversities();
    res.json({ success: true, data: unis });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PATCH /api/superadmin/universities/:id/validate — validate a university */
superadminRouter.patch('/universities/:id/validate', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const result = await validateUniversity(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* DELETE /api/superadmin/universities/:id/reject — reject & delete a university */
superadminRouter.delete('/universities/:id/reject', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await rejectUniversity(req.params.id as string);
    res.json({ success: true, data: { message: 'University rejected and removed' } });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default superadminRouter;
