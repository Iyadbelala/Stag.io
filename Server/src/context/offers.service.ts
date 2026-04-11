import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, internshipOffers, applications, students } from '../model/schema';

export interface CreateOfferInput {
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  bannerUrl?: string;
}

export interface OfferResult {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  bannerUrl: string | null;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyIndustry: string | null;
  companyLocation: string | null;
  applicationCount: number;
  createdAt: string;
}

async function getCompanyForUser(userId: string) {
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
  return company ?? null;
}

async function toOfferResult(offer: typeof internshipOffers.$inferSelect): Promise<OfferResult> {
  const [company] = await db.select().from(companies).where(eq(companies.id, offer.companyId));
  const [appCount] = await db
    .select({ value: count() })
    .from(applications)
    .where(eq(applications.offerId, offer.id));

  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type,
    status: offer.status,
    bannerUrl: offer.bannerUrl ?? null,
    companyId: offer.companyId,
    companyName: company?.companyName ?? '',
    companyLogoUrl: company?.logoUrl ?? null,
    companyIndustry: company?.industry ?? null,
    companyLocation: company?.location ?? null,
    applicationCount: appCount?.value ?? 0,
    createdAt: offer.createdAt.toISOString(),
  };
}

export async function createOffer(userId: string, input: CreateOfferInput): Promise<OfferResult> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (!company.isValidated) {
    const err = new Error('Your company must be validated by an admin before posting offers') as Error & { code: string; status: number };
    err.code = 'NOT_VALIDATED';
    err.status = 403;
    throw err;
  }

  const [offer] = await db.insert(internshipOffers).values({
    companyId: company.id,
    title: input.title,
    description: input.description,
    requirements: input.requirements,
    duration: input.duration,
    location: input.location,
    type: input.type,
    bannerUrl: input.bannerUrl ?? null,
  }).returning();

  return toOfferResult(offer);
}

export async function getCompanyOffers(userId: string): Promise<OfferResult[]> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const offers = await db
    .select()
    .from(internshipOffers)
    .where(eq(internshipOffers.companyId, company.id))
    .orderBy(desc(internshipOffers.createdAt));

  return Promise.all(offers.map(toOfferResult));
}

export async function updateOffer(
  userId: string,
  offerId: string,
  input: Partial<CreateOfferInput>,
): Promise<OfferResult> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [existing] = await db
    .select()
    .from(internshipOffers)
    .where(and(eq(internshipOffers.id, offerId), eq(internshipOffers.companyId, company.id)));

  if (!existing) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.requirements !== undefined) updateData.requirements = input.requirements;
  if (input.duration !== undefined) updateData.duration = input.duration;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.bannerUrl !== undefined) updateData.bannerUrl = input.bannerUrl;

  const [updated] = await db
    .update(internshipOffers)
    .set(updateData)
    .where(eq(internshipOffers.id, offerId))
    .returning();

  return toOfferResult(updated);
}

export async function deleteOffer(userId: string, offerId: string): Promise<void> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [offer] = await db
    .select()
    .from(internshipOffers)
    .where(and(eq(internshipOffers.id, offerId), eq(internshipOffers.companyId, company.id)));

  if (!offer) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  await db.delete(internshipOffers).where(eq(internshipOffers.id, offerId));
}

export async function updateOfferStatus(
  userId: string,
  offerId: string,
  newStatus: 'draft' | 'active' | 'closed',
): Promise<OfferResult> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [existing] = await db
    .select()
    .from(internshipOffers)
    .where(and(eq(internshipOffers.id, offerId), eq(internshipOffers.companyId, company.id)));

  if (!existing) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [updated] = await db
    .update(internshipOffers)
    .set({ status: newStatus })
    .where(eq(internshipOffers.id, offerId))
    .returning();

  return toOfferResult(updated);
}

export interface OfferApplicant {
  id: string;
  studentId: string;
  applicantName: string;
  email: string;
  department: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
  bio: string | null;
  coverLetter: string | null;
  cvUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  status: string;
  appliedAt: string;
}

export async function getOfferApplicants(
  userId: string,
  offerId: string,
): Promise<OfferApplicant[]> {
  const company = await getCompanyForUser(userId);

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [offer] = await db
    .select()
    .from(internshipOffers)
    .where(and(eq(internshipOffers.id, offerId), eq(internshipOffers.companyId, company.id)));

  if (!offer) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.offerId, offerId))
    .orderBy(desc(applications.appliedAt));

  const result: OfferApplicant[] = [];
  for (const app of apps) {
    const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
    if (!student) continue;
    const [user] = await db.select().from(users).where(eq(users.id, student.userId));
    if (!user) continue;

    result.push({
      id: app.id,
      studentId: student.id,
      applicantName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      department: student.department,
      profilePhotoUrl: student.profilePhotoUrl,
      skills: student.skills,
      bio: student.bio,
      coverLetter: app.coverLetter,
      cvUrl: app.cvUrl,
      linkedinUrl: student.linkedinUrl,
      githubUrl: student.githubUrl,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
    });
  }

  return result;
}

export async function getPublicOfferById(offerId: string): Promise<OfferResult | null> {
  const [row] = await db
    .select({ offer: internshipOffers })
    .from(internshipOffers)
    .innerJoin(companies, eq(internshipOffers.companyId, companies.id))
    .where(and(eq(internshipOffers.id, offerId), eq(internshipOffers.status, 'active'), eq(companies.isValidated, true)));

  if (!row) return null;
  return toOfferResult(row.offer);
}

export async function listPublicOffers(): Promise<OfferResult[]> {
  const rows = await db
    .select({ offer: internshipOffers })
    .from(internshipOffers)
    .innerJoin(companies, eq(internshipOffers.companyId, companies.id))
    .where(and(eq(internshipOffers.status, 'active'), eq(companies.isValidated, true)))
    .orderBy(desc(internshipOffers.createdAt));

  return Promise.all(rows.map((r) => toOfferResult(r.offer)));
}
