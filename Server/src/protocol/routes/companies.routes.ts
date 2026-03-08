import { Router, Request, Response } from 'express';
import { listPublicCompanies } from '../../context/companies.service';

const companiesRouter = Router();

/* GET /api/companies — public list of all companies */
companiesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const companies = await listPublicCompanies();
    res.json({ success: true, data: companies });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default companiesRouter;
