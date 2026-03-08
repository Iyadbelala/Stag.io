import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getCompanyProfile, updateCompanyProfile } from '../../context/company-profile.service';
import { getCompanyDashboard } from '../../context/company-dashboard.service';

const companyProfileRouter = Router();

/* GET /api/company/profile */
companyProfileRouter.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getCompanyProfile(req.user!.sub);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PUT /api/company/profile */
companyProfileRouter.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { companyName, industry, website, description, location, contactPerson } = req.body;
    const profile = await updateCompanyProfile(req.user!.sub, {
      companyName, industry, website, description, location, contactPerson,
    });
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/company/dashboard */
companyProfileRouter.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const dashboard = await getCompanyDashboard(req.user!.sub);
    res.json({ success: true, data: dashboard });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default companyProfileRouter;
