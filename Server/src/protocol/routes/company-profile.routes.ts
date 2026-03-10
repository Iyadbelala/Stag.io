import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getCompanyProfile, updateCompanyProfile } from '../../context/company-profile.service';
import { getCompanyDashboard } from '../../context/company-dashboard.service';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { db } from '../../model/db';
import { companies } from '../../model/schema';
import { eq } from 'drizzle-orm';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

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

/* POST /api/company/logo — upload company logo */
companyProfileRouter.post('/logo', requireAuth, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const result = await uploadToCloudinary(req.file.buffer, 'stag-io/company-logos');
    await db.update(companies)
      .set({ logoUrl: result.url, updatedAt: new Date() })
      .where(eq(companies.userId, req.user!.sub));
    res.json({ success: true, data: { url: result.url } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

/* DELETE /api/company/logo — remove company logo */
companyProfileRouter.delete('/logo', requireAuth, async (req: Request, res: Response) => {
  try {
    await db.update(companies)
      .set({ logoUrl: null, updatedAt: new Date() })
      .where(eq(companies.userId, req.user!.sub));
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default companyProfileRouter;
