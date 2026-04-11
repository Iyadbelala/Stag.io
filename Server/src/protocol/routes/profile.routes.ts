import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getStudentProfile, updateStudentProfile } from '../../context/profile.service';
import { getStudentDashboard } from '../../context/student-dashboard.service';
import { generateStudentCv } from '../../context/cv.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../../lib/cloudinary';
import { db } from '../../model/db';
import { students, companies, applications, internshipOffers } from '../../model/schema';
import { eq, and as andOp, inArray } from 'drizzle-orm';
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

const profileRouter = Router();

/* GET /api/profile — get current user's profile */
profileRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getStudentProfile(req.user!.sub);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* PUT /api/profile — update current user's profile */
profileRouter.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, department, bio, skills, linkedinUrl, githubUrl } = req.body;
    const profile = await updateStudentProfile(req.user!.sub, {
      firstName,
      lastName,
      department,
      bio,
      skills,
      linkedinUrl,
      githubUrl,
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

/* GET /api/profile/dashboard — student dashboard stats */
profileRouter.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const dashboard = await getStudentDashboard(req.user!.sub);
    res.json({ success: true, data: dashboard });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/profile/photo — upload profile photo */
profileRouter.post('/photo', requireAuth, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const result = await uploadToCloudinary(req.file.buffer, 'stag-io/profile-photos');
    await db.update(students)
      .set({ profilePhotoUrl: result.url, updatedAt: new Date() })
      .where(eq(students.userId, req.user!.sub));
    res.json({ success: true, data: { url: result.url } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

/* DELETE /api/profile/photo — remove profile photo */
profileRouter.delete('/photo', requireAuth, async (req: Request, res: Response) => {
  try {
    await db.update(students)
      .set({ profilePhotoUrl: null, updatedAt: new Date() })
      .where(eq(students.userId, req.user!.sub));
    res.json({ success: true });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

/* POST /api/profile/portfolio — upload portfolio photo */
profileRouter.post('/portfolio', requireAuth, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const result = await uploadToCloudinary(req.file.buffer, 'stag-io/portfolio');
    const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub));
    const current = student?.portfolioPhotos ?? [];
    await db.update(students)
      .set({ portfolioPhotos: [...current, result.url], updatedAt: new Date() })
      .where(eq(students.userId, req.user!.sub));
    res.json({ success: true, data: { url: result.url, photos: [...current, result.url] } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

/* DELETE /api/profile/portfolio — remove a portfolio photo by URL */
profileRouter.delete('/portfolio', requireAuth, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: { message: 'Photo URL is required' } });
      return;
    }
    const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub));
    const current = student?.portfolioPhotos ?? [];
    const updated = current.filter((p: string) => p !== url);
    await db.update(students)
      .set({ portfolioPhotos: updated, updatedAt: new Date() })
      .where(eq(students.userId, req.user!.sub));
    res.json({ success: true, data: { photos: updated } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

/* POST /api/profile/cv/generate — generate CV URL and save to profile */
profileRouter.post('/cv/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const cvUrl = `${baseUrl}/api/profile/cv/${req.user!.sub}`;

    // Save CV URL to student profile
    await db.update(students)
      .set({ cvUrl, updatedAt: new Date() })
      .where(eq(students.userId, req.user!.sub));

    res.json({ success: true, data: { url: cvUrl } });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/profile/cv/download — download your own CV as PDF (requires auth) */
profileRouter.get('/cv/download', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getStudentProfile(req.user!.sub);
    const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'student';
    const safeName = fullName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') || 'student';
    const fileName = `${safeName}_CV.pdf`;

    const pdfBuffer = await generateStudentCv(req.user!.sub);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/profile/cv/:userId — view a student's CV PDF (authorized access only) */
profileRouter.get('/cv/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const requesterId = req.user!.sub;
    const requesterRole = req.user!.role;

    // Allow: own CV, admins/superadmins, or companies with an application from this student
    const isOwner = requesterId === userId;
    const isAdmin = requesterRole === 'admin' || requesterRole === 'superadmin';

    if (!isOwner && !isAdmin) {
      if (requesterRole === 'company') {
        // Check if the company has received an application from this student
        const [company] = await db.select().from(companies).where(eq(companies.userId, requesterId));
        if (!company) {
          res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
          return;
        }
        const [student] = await db.select().from(students).where(eq(students.userId, userId));
        if (!student) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });
          return;
        }
        // Find any application from this student to one of the company's offers
        const companyOffers = await db.select({ id: internshipOffers.id }).from(internshipOffers).where(eq(internshipOffers.companyId, company.id));
        const offerIds = companyOffers.map(o => o.id);
        let hasApplication = false;
        if (offerIds.length > 0) {
          const [app] = await db.select({ id: applications.id }).from(applications)
            .where(andOp(eq(applications.studentId, student.id), inArray(applications.offerId, offerIds)))
            .limit(1);
          hasApplication = !!app;
        }
        if (!hasApplication) {
          res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
          return;
        }
      } else {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
        return;
      }
    }

    const profile = await getStudentProfile(userId);
    const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'student';
    // Sanitize filename to prevent header injection
    const safeName = fullName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') || 'student';
    const fileName = `${safeName}_CV.pdf`;

    const pdfBuffer = await generateStudentCv(userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default profileRouter;
