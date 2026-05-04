import { Router, Request, Response } from 'express';
import { count, eq } from 'drizzle-orm';
import { db } from '../../model/db.js';
import { students, companies, universities, internshipOffers } from '../../model/schema.js';

const publicRouter = Router();

/* GET /api/public/stats — live platform counts for the public homepage */
publicRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [offersRow, companiesRow, studentsRow, universitiesRow] = await Promise.all([
      db.select({ value: count() }).from(internshipOffers),
      db.select({ value: count() }).from(companies).where(eq(companies.isValidated, true)),
      db.select({ value: count() }).from(students),
      db.select({ value: count() }).from(universities).where(eq(universities.isValidated, true)),
    ]);

    res.json({
      success: true,
      data: {
        internshipsPosted: offersRow[0].value,
        partnerCompanies: companiesRow[0].value,
        studentsConnected: studentsRow[0].value,
        universities: universitiesRow[0].value,
      },
    });
  } catch (err) {
    const e = err as { message?: string };
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: e.message ?? 'Failed to load stats' },
    });
  }
});

export default publicRouter;
