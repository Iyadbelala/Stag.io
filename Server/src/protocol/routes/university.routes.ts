import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getUniversityProfile,
  updateUniversityProfile,
  getUniversityStudents,
  getUniversityDashboard,
  getStudentApplicationsForUniversity,
  validateApplication,
  getActiveInternships,
  getPendingValidations,
} from '../../context/university.service';

const universityRouter = Router();

/* ── Middleware: only university role may access ── */
function requireUniversity(req: Request, res: Response, next: () => void): void {
  if (req.user?.role !== 'university') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'University access required' },
    });
    return;
  }
  next();
}

/* GET /api/university/profile */
universityRouter.get('/profile', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const profile = await getUniversityProfile(req.user!.sub);
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'University profile not found' } });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* PUT /api/university/profile */
universityRouter.put('/profile', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const { universityName, website, description, location } = req.body;
    const updated = await updateUniversityProfile(req.user!.sub, { universityName, website, description, location });
    if (!updated) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'University profile not found' } });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* GET /api/university/students */
universityRouter.get('/students', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const students = await getUniversityStudents(req.user!.sub);
    res.json({ success: true, data: students });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* GET /api/university/dashboard */
universityRouter.get('/dashboard', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const dashboard = await getUniversityDashboard(req.user!.sub);
    if (!dashboard) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'University not found' } });
      return;
    }
    res.json({ success: true, data: dashboard });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* GET /api/university/students/:studentId/applications */
universityRouter.get('/students/:studentId/applications', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const apps = await getStudentApplicationsForUniversity(req.user!.sub, req.params.studentId as string);
    res.json({ success: true, data: apps });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* PATCH /api/university/applications/:applicationId/validate */
universityRouter.patch('/applications/:applicationId/validate', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const result = await validateApplication(req.user!.sub, req.params.applicationId as string);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* GET /api/university/internships/active */
universityRouter.get('/internships/active', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const internships = await getActiveInternships(req.user!.sub);
    res.json({ success: true, data: internships });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

/* GET /api/university/internships/pending */
universityRouter.get('/internships/pending', requireAuth, requireUniversity, async (req: Request, res: Response) => {
  try {
    const pending = await getPendingValidations(req.user!.sub);
    res.json({ success: true, data: pending });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({ success: false, error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message } });
  }
});

export default universityRouter;
