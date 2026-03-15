import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createReview,
  getReviewsForUser,
  getReviewsByUser,
  getReviewsForApplication,
  getUserAverageRating,
  getPendingReviews,
} from '../../context/reviews.service';

const reviewsRouter = Router();

/* POST /api/reviews — submit a review */
reviewsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { applicationId, rating, comment } = req.body;

  if (!applicationId || rating === undefined) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'applicationId and rating are required' },
    });
    return;
  }

  try {
    const review = await createReview(req.user!.sub, { applicationId, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/pending — get internships awaiting review by current user */
reviewsRouter.get('/pending', requireAuth, async (req: Request, res: Response) => {
  try {
    const pending = await getPendingReviews(req.user!.sub);
    res.json({ success: true, data: pending });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/my — reviews written by current user */
reviewsRouter.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const reviews = await getReviewsByUser(req.user!.sub);
    res.json({ success: true, data: reviews });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/received — reviews received by current user */
reviewsRouter.get('/received', requireAuth, async (req: Request, res: Response) => {
  try {
    const reviews = await getReviewsForUser(req.user!.sub);
    res.json({ success: true, data: reviews });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/user/:userId — public reviews for a specific user */
reviewsRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const reviews = await getReviewsForUser(req.params.userId as string);
    res.json({ success: true, data: reviews });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/user/:userId/rating — average rating for a user */
reviewsRouter.get('/user/:userId/rating', async (req: Request, res: Response) => {
  try {
    const rating = await getUserAverageRating(req.params.userId as string);
    res.json({ success: true, data: rating });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

/* GET /api/reviews/application/:applicationId — reviews for a specific application */
reviewsRouter.get('/application/:applicationId', requireAuth, async (req: Request, res: Response) => {
  try {
    const reviews = await getReviewsForApplication(req.params.applicationId as string);
    res.json({ success: true, data: reviews });
  } catch (err: unknown) {
    const e = err as { code?: string; status?: number; message: string };
    res.status(e.status ?? 500).json({
      success: false,
      error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message },
    });
  }
});

export default reviewsRouter;
