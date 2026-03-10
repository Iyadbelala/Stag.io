import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getPendingCompanies,
  validateCompany,
  rejectCompany,
} from '../../context/admin.service';
import { prisma } from '../../model/prisma';

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
    const [totalUsers, totalStudents, totalCompanies, validatedCompanies, totalOffers, totalApplications] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.company.count(),
      prisma.company.count({ where: { isValidated: true } }),
      prisma.internshipOffer.count(),
      prisma.application.count(),
    ]);

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

export default superadminRouter;
