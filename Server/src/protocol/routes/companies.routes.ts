import { Router, Request, Response } from 'express';
import { listPublicCompanies, getCompanyPublicProfile } from '../../context/companies.service';

const companiesRouter = Router();

/** Safe error handler */
function handleError(res: Response, err: unknown) {
  const e = err as { code?: string; status?: number; message: string };
  const status = e.status ?? 500;
  res.status(status).json({
    success: false,
    error: {
      code: e.code ?? 'INTERNAL_ERROR',
      message: status === 500 ? 'An unexpected error occurred' : e.message,
    },
  });
}

/* GET /api/companies — public list of all companies */
companiesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const companies = await listPublicCompanies();
    res.json({ success: true, data: companies });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

/* GET /api/companies/:id — public company profile */
companiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const profile = await getCompanyPublicProfile(req.params.id as string);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    handleError(res, err);
  }
});

export default companiesRouter;
