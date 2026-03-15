import { eq, and, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, students, internshipOffers, applications, reviews } from '../model/schema';
import { sendNotification } from './notifications.service';

export interface CreateReviewInput {
  applicationId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResult {
  id: string;
  applicationId: string;
  reviewerUserId: string;
  revieweeUserId: string;
  reviewerRole: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
  revieweeName: string;
  offerTitle: string;
  companyName: string;
}

/**
 * Submit a review for a completed/validated internship.
 * - Students review the company experience
 * - Companies review the student performance
 */
export async function createReview(
  userId: string,
  input: CreateReviewInput,
): Promise<ReviewResult> {
  // Validate rating
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    const err = new Error('Rating must be an integer between 1 and 5') as Error & { code: string; status: number };
    err.code = 'INVALID_RATING';
    err.status = 400;
    throw err;
  }

  // Find the application
  const [application] = await db.select().from(applications).where(eq(applications.id, input.applicationId));
  if (!application) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Only validated (completed) internships can be reviewed
  if (application.status !== 'validated') {
    const err = new Error('Only validated internships can be reviewed') as Error & { code: string; status: number };
    err.code = 'NOT_VALIDATED';
    err.status = 400;
    throw err;
  }

  // Get offer and company
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, application.offerId));
  if (!offer) {
    const err = new Error('Internship offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [company] = await db.select().from(companies).where(eq(companies.id, offer.companyId));
  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Get student
  const [student] = await db.select().from(students).where(eq(students.id, application.studentId));
  if (!student) {
    const err = new Error('Student not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Determine reviewer role and reviewee
  let reviewerRole: 'student' | 'company';
  let revieweeUserId: string;

  if (userId === student.userId) {
    // Student reviewing the company
    reviewerRole = 'student';
    revieweeUserId = company.userId;
  } else if (userId === company.userId) {
    // Company reviewing the student
    reviewerRole = 'company';
    revieweeUserId = student.userId;
  } else {
    const err = new Error('You are not involved in this application') as Error & { code: string; status: number };
    err.code = 'FORBIDDEN';
    err.status = 403;
    throw err;
  }

  // Check for duplicate review
  const [existing] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.applicationId, input.applicationId),
        eq(reviews.reviewerUserId, userId),
      ),
    );

  if (existing) {
    const err = new Error('You have already reviewed this internship') as Error & { code: string; status: number };
    err.code = 'DUPLICATE';
    err.status = 409;
    throw err;
  }

  // Insert review
  const [review] = await db.insert(reviews).values({
    applicationId: input.applicationId,
    reviewerUserId: userId,
    revieweeUserId,
    reviewerRole,
    rating: input.rating,
    comment: input.comment ?? null,
  }).returning();

  // Get names for response
  const [reviewerUser] = await db.select().from(users).where(eq(users.id, userId));
  const [revieweeUser] = await db.select().from(users).where(eq(users.id, revieweeUserId));

  const reviewerName = reviewerRole === 'student'
    ? `${reviewerUser.firstName ?? ''} ${reviewerUser.lastName ?? ''}`.trim()
    : company.companyName;
  const revieweeName = reviewerRole === 'student'
    ? company.companyName
    : `${revieweeUser.firstName ?? ''} ${revieweeUser.lastName ?? ''}`.trim();

  // Notify the reviewee
  sendNotification(
    revieweeUserId,
    'new_review',
    'New Review Received',
    `${reviewerName} left you a ${input.rating}-star review for "${offer.title}"`,
    review.id,
  ).catch(() => {});

  return {
    id: review.id,
    applicationId: review.applicationId,
    reviewerUserId: review.reviewerUserId,
    revieweeUserId: review.revieweeUserId,
    reviewerRole: review.reviewerRole,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    reviewerName,
    revieweeName,
    offerTitle: offer.title,
    companyName: company.companyName,
  };
}

/**
 * Get all reviews received by a user (their rating profile).
 */
export async function getReviewsForUser(userId: string): Promise<ReviewResult[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.revieweeUserId, userId))
    .orderBy(desc(reviews.createdAt));

  return Promise.all(rows.map((r) => enrichReview(r)));
}

/**
 * Get all reviews written by a user.
 */
export async function getReviewsByUser(userId: string): Promise<ReviewResult[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewerUserId, userId))
    .orderBy(desc(reviews.createdAt));

  return Promise.all(rows.map((r) => enrichReview(r)));
}

/**
 * Get reviews for a specific application.
 */
export async function getReviewsForApplication(applicationId: string): Promise<ReviewResult[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.applicationId, applicationId))
    .orderBy(desc(reviews.createdAt));

  return Promise.all(rows.map((r) => enrichReview(r)));
}

/**
 * Get average rating for a user.
 */
export async function getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.revieweeUserId, userId));

  if (rows.length === 0) return { average: 0, count: 0 };

  const sum = rows.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / rows.length) * 10) / 10,
    count: rows.length,
  };
}

/**
 * Check which of the user's validated applications still need reviews.
 */
export async function getPendingReviews(userId: string): Promise<Array<{
  applicationId: string;
  offerTitle: string;
  companyName: string;
  role: 'student' | 'company';
}>> {
  // Check if user is a student
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  // Check if user is a company
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));

  const pending: Array<{
    applicationId: string;
    offerTitle: string;
    companyName: string;
    role: 'student' | 'company';
  }> = [];

  if (student) {
    // Find validated applications by this student
    const apps = await db
      .select()
      .from(applications)
      .where(and(eq(applications.studentId, student.id), eq(applications.status, 'validated')));

    for (const app of apps) {
      const [existingReview] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.applicationId, app.id), eq(reviews.reviewerUserId, userId)));

      if (!existingReview) {
        const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
        const [comp] = offer
          ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
          : [undefined];

        pending.push({
          applicationId: app.id,
          offerTitle: offer?.title ?? '',
          companyName: comp?.companyName ?? '',
          role: 'student',
        });
      }
    }
  }

  if (company) {
    // Find validated applications for this company's offers
    const offers = await db.select().from(internshipOffers).where(eq(internshipOffers.companyId, company.id));

    for (const offer of offers) {
      const apps = await db
        .select()
        .from(applications)
        .where(and(eq(applications.offerId, offer.id), eq(applications.status, 'validated')));

      for (const app of apps) {
        const [existingReview] = await db
          .select()
          .from(reviews)
          .where(and(eq(reviews.applicationId, app.id), eq(reviews.reviewerUserId, userId)));

        if (!existingReview) {
          pending.push({
            applicationId: app.id,
            offerTitle: offer.title,
            companyName: company.companyName,
            role: 'company',
          });
        }
      }
    }
  }

  return pending;
}

/* ── Helper ── */

async function enrichReview(r: typeof reviews.$inferSelect): Promise<ReviewResult> {
  const [application] = await db.select().from(applications).where(eq(applications.id, r.applicationId));
  const [offer] = application
    ? await db.select().from(internshipOffers).where(eq(internshipOffers.id, application.offerId))
    : [undefined];
  const [company] = offer
    ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
    : [undefined];

  const [reviewerUser] = await db.select().from(users).where(eq(users.id, r.reviewerUserId));
  const [revieweeUser] = await db.select().from(users).where(eq(users.id, r.revieweeUserId));

  let reviewerName: string;
  let revieweeName: string;

  if (r.reviewerRole === 'student') {
    reviewerName = `${reviewerUser?.firstName ?? ''} ${reviewerUser?.lastName ?? ''}`.trim();
    revieweeName = company?.companyName ?? '';
  } else {
    const [reviewerCompany] = await db.select().from(companies).where(eq(companies.userId, r.reviewerUserId));
    reviewerName = reviewerCompany?.companyName ?? '';
    revieweeName = `${revieweeUser?.firstName ?? ''} ${revieweeUser?.lastName ?? ''}`.trim();
  }

  return {
    id: r.id,
    applicationId: r.applicationId,
    reviewerUserId: r.reviewerUserId,
    revieweeUserId: r.revieweeUserId,
    reviewerRole: r.reviewerRole,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    reviewerName,
    revieweeName,
    offerTitle: offer?.title ?? '',
    companyName: company?.companyName ?? '',
  };
}
