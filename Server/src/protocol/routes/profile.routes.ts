import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getStudentProfile, updateStudentProfile } from '../../context/profile.service';

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
    const { firstName, lastName, department, bio, skills } = req.body;
    const profile = await updateStudentProfile(req.user!.sub, {
      firstName,
      lastName,
      department,
      bio,
      skills,
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

export default profileRouter;
