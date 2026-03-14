import { eq, and } from 'drizzle-orm';
import { db } from '../model/db';
import { students, internshipOffers, companies, savedOffers } from '../model/schema';

function makeError(message: string, code: string, status: number) {
  const err = new Error(message) as Error & { code: string; status: number };
  err.code = code;
  err.status = status;
  return err;
}

/* ── Toggle save/unsave an offer ── */
export async function toggleSavedOffer(userId: string, offerId: string) {
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  if (!student) throw makeError('Student profile not found', 'NOT_FOUND', 404);

  const [offer] = await db.select({ id: internshipOffers.id }).from(internshipOffers).where(eq(internshipOffers.id, offerId));
  if (!offer) throw makeError('Offer not found', 'NOT_FOUND', 404);

  const [existing] = await db
    .select()
    .from(savedOffers)
    .where(and(eq(savedOffers.studentId, student.id), eq(savedOffers.offerId, offerId)));

  if (existing) {
    await db.delete(savedOffers).where(eq(savedOffers.id, existing.id));
    return { saved: false };
  }

  await db.insert(savedOffers).values({ studentId: student.id, offerId });
  return { saved: true };
}

/* ── Get all saved offer IDs for a student ── */
export async function getSavedOfferIds(userId: string): Promise<string[]> {
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  if (!student) return [];

  const rows = await db
    .select({ offerId: savedOffers.offerId })
    .from(savedOffers)
    .where(eq(savedOffers.studentId, student.id));

  return rows.map(r => r.offerId);
}
