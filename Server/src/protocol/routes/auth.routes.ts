import { Router, Request, Response } from 'express';
import { registerStudent, loginUser } from '../../context/auth.service';

const authRouter = Router();

/* POST /api/auth/register */
authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, university } = req.body;

  if (!email || !password || !firstName || !lastName || !university) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'All fields are required' },
    });
    return;
  }

  try {
    const result = await registerStudent({ email, password, firstName, lastName, university });
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* POST /api/auth/login */
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
    });
    return;
  }

  try {
    const result = await loginUser({ email, password });
    res.status(200).json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default authRouter;
