import { eq, and, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, students, internshipOffers, applications } from '../model/schema';

export interface ApplyInput {
  coverLetter?: string;
  cvUrl?: string;
}

export interface ApplicationResult {
  id: string;
  studentId: string;
  offerId: string;
  coverLetter: string | null;
  cvUrl: string | null;
  status: string;
  appliedAt: string;
  offerTitle: string;
  companyName: string;
}

/**
 * A student applies to an internship offer.
 */
export async function applyToOffer(
  userId: string,
  offerId: string,
  input: ApplyInput,
): Promise<ApplicationResult> {
  // 1. Ensure the user has a student profile
  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  if (!student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // 2. Verify the offer exists and is active
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, offerId));

  if (!offer || offer.status !== 'active') {
    const err = new Error('Internship offer not found or no longer active') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [company] = await db.select().from(companies).where(eq(companies.id, offer.companyId));

  // 3. Check for duplicate application
  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.studentId, student.id), eq(applications.offerId, offerId)));

  if (existing) {
    const err = new Error('You have already applied to this internship') as Error & { code: string; status: number };
    err.code = 'DUPLICATE';
    err.status = 409;
    throw err;
  }

  // 4. Create the application
  const [application] = await db.insert(applications).values({
    studentId: student.id,
    offerId,
    coverLetter: input.coverLetter ?? null,
    cvUrl: input.cvUrl ?? null,
  }).returning();

  return {
    id: application.id,
    studentId: application.studentId,
    offerId: application.offerId,
    coverLetter: application.coverLetter,
    cvUrl: application.cvUrl,
    status: application.status,
    appliedAt: application.appliedAt.toISOString(),
    offerTitle: offer.title,
    companyName: company?.companyName ?? '',
  };
}

/**
 * Get all applications for a student.
 */
export async function getStudentApplications(userId: string): Promise<ApplicationResult[]> {
  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  if (!student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.studentId, student.id))
    .orderBy(desc(applications.appliedAt));

  const results: ApplicationResult[] = [];
  for (const a of apps) {
    const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId));
    const [company] = offer
      ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
      : [undefined];

    results.push({
      id: a.id,
      studentId: a.studentId,
      offerId: a.offerId,
      coverLetter: a.coverLetter,
      cvUrl: a.cvUrl,
      status: a.status,
      appliedAt: a.appliedAt.toISOString(),
      offerTitle: offer?.title ?? '',
      companyName: company?.companyName ?? '',
    });
  }

  return results;
}

/**
 * Company updates an application's status (accept / reject).
 */
export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  newStatus: 'accepted' | 'rejected',
): Promise<{ id: string; status: string }> {
  // Verify user owns the company that owns the offer
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [application] = await db.select().from(applications).where(eq(applications.id, applicationId));

  if (!application) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, application.offerId));

  if (!offer || offer.companyId !== company.id) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [updated] = await db
    .update(applications)
    .set({ status: newStatus })
    .where(eq(applications.id, applicationId))
    .returning();

  return { id: updated.id, status: updated.status };
}
