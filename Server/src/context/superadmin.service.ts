import { eq, desc, ilike, or, and, isNull, isNotNull, count, sql } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, students, universities, internshipOffers, applications, auditLogs } from '../model/schema';

/* ══════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════ */
function serviceError(message: string, code: string, status: number): never {
  const err = new Error(message) as Error & { code: string; status: number };
  err.code = code;
  err.status = status;
  throw err;
}

/* ══════════════════════════════════════════════
   Users — list, deactivate, reactivate
   ══════════════════════════════════════════════ */
export interface UserListItem {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export async function listUsers(opts: {
  q?: string;
  role?: string;
  status?: 'active' | 'deactivated';
  page?: number;
  limit?: number;
}): Promise<UserListResult> {
  const page = Math.max(opts.page ?? 1, 1);
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  const offset = (page - 1) * limit;

  const conditions = [];

  if (opts.q) {
    const q = `%${opts.q}%`;
    conditions.push(
      or(
        ilike(users.email, q),
        ilike(users.firstName, q),
        ilike(users.lastName, q),
      )
    );
  }

  if (opts.role) {
    conditions.push(eq(users.role, opts.role as 'student' | 'company' | 'admin' | 'superadmin' | 'university'));
  }

  if (opts.status === 'active') {
    conditions.push(isNull(users.deactivatedAt));
  } else if (opts.status === 'deactivated') {
    conditions.push(isNotNull(users.deactivatedAt));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db.select({ value: count() }).from(users).where(where);

  const rows = await db
    .select()
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    users: rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      isEmailVerified: u.isEmailVerified,
      deactivatedAt: u.deactivatedAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    })),
    total: totalRow.value,
    page,
    limit,
  };
}

export async function deactivateUser(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) serviceError('User not found', 'NOT_FOUND', 404);
  if (user.role === 'superadmin') serviceError('Cannot deactivate a superadmin', 'FORBIDDEN', 403);
  if (user.deactivatedAt) serviceError('User is already deactivated', 'ALREADY_DEACTIVATED', 400);

  await db.update(users).set({ deactivatedAt: new Date() }).where(eq(users.id, userId));
}

export async function reactivateUser(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) serviceError('User not found', 'NOT_FOUND', 404);
  if (!user.deactivatedAt) serviceError('User is not deactivated', 'NOT_DEACTIVATED', 400);

  await db.update(users).set({ deactivatedAt: null }).where(eq(users.id, userId));
}

/* ══════════════════════════════════════════════
   Companies — list all (with search/filter)
   ══════════════════════════════════════════════ */
export interface CompanyListItem {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  contactPerson: string | null;
  email: string;
  website: string | null;
  logoUrl: string | null;
  isValidated: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

export async function listAllCompanies(opts: {
  q?: string;
  validated?: 'true' | 'false';
}): Promise<CompanyListItem[]> {
  const rows = await db
    .select()
    .from(companies)
    .orderBy(desc(companies.createdAt));

  const result: CompanyListItem[] = [];
  for (const c of rows) {
    const [user] = await db.select().from(users).where(eq(users.id, c.userId));

    if (opts.validated === 'true' && !c.isValidated) continue;
    if (opts.validated === 'false' && c.isValidated) continue;

    if (opts.q) {
      const q = opts.q.toLowerCase();
      const match =
        c.companyName.toLowerCase().includes(q) ||
        (c.industry ?? '').toLowerCase().includes(q) ||
        (c.location ?? '').toLowerCase().includes(q) ||
        (user?.email ?? '').toLowerCase().includes(q);
      if (!match) continue;
    }

    result.push({
      id: c.id,
      companyName: c.companyName,
      industry: c.industry,
      location: c.location,
      contactPerson: c.contactPerson,
      email: user?.email ?? '',
      website: c.website,
      logoUrl: c.logoUrl,
      isValidated: c.isValidated,
      deactivatedAt: user?.deactivatedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    });
  }

  return result;
}

/* ══════════════════════════════════════════════
   Universities — list all (with search/filter)
   ══════════════════════════════════════════════ */
export interface UniversityListItem {
  id: string;
  universityName: string;
  domain: string;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  email: string;
  isValidated: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

export async function listAllUniversities(opts: {
  q?: string;
  validated?: 'true' | 'false';
}): Promise<UniversityListItem[]> {
  const rows = await db
    .select()
    .from(universities)
    .orderBy(desc(universities.createdAt));

  const result: UniversityListItem[] = [];
  for (const u of rows) {
    const [user] = await db.select().from(users).where(eq(users.id, u.userId));

    if (opts.validated === 'true' && !u.isValidated) continue;
    if (opts.validated === 'false' && u.isValidated) continue;

    if (opts.q) {
      const q = opts.q.toLowerCase();
      const match =
        u.universityName.toLowerCase().includes(q) ||
        u.domain.toLowerCase().includes(q) ||
        (u.location ?? '').toLowerCase().includes(q) ||
        (user?.email ?? '').toLowerCase().includes(q);
      if (!match) continue;
    }

    result.push({
      id: u.id,
      universityName: u.universityName,
      domain: u.domain,
      website: u.website,
      location: u.location,
      logoUrl: u.logoUrl,
      description: u.description,
      email: user?.email ?? '',
      isValidated: u.isValidated,
      deactivatedAt: user?.deactivatedAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    });
  }

  return result;
}

/* ══════════════════════════════════════════════
   Offers — list all, force-close, delete
   ══════════════════════════════════════════════ */
export interface OfferListItem {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  status: string;
  duration: string;
  createdAt: string;
}

export async function listAllOffers(opts: {
  q?: string;
  status?: string;
}): Promise<OfferListItem[]> {
  const rows = await db
    .select()
    .from(internshipOffers)
    .orderBy(desc(internshipOffers.createdAt));

  const result: OfferListItem[] = [];
  for (const o of rows) {
    const [company] = await db.select().from(companies).where(eq(companies.id, o.companyId));

    if (opts.status && o.status !== opts.status) continue;

    if (opts.q) {
      const q = opts.q.toLowerCase();
      const match =
        o.title.toLowerCase().includes(q) ||
        (company?.companyName ?? '').toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q);
      if (!match) continue;
    }

    result.push({
      id: o.id,
      title: o.title,
      companyName: company?.companyName ?? 'Unknown',
      location: o.location,
      type: o.type,
      status: o.status,
      duration: o.duration,
      createdAt: o.createdAt.toISOString(),
    });
  }

  return result;
}

export async function forceCloseOffer(offerId: string): Promise<void> {
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, offerId));
  if (!offer) serviceError('Offer not found', 'NOT_FOUND', 404);
  if (offer.status === 'closed') serviceError('Offer is already closed', 'ALREADY_CLOSED', 400);

  await db.update(internshipOffers).set({ status: 'closed' }).where(eq(internshipOffers.id, offerId));
}

export async function deleteOffer(offerId: string): Promise<void> {
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, offerId));
  if (!offer) serviceError('Offer not found', 'NOT_FOUND', 404);

  await db.delete(internshipOffers).where(eq(internshipOffers.id, offerId));
}

/* ══════════════════════════════════════════════
   Analytics — aggregated platform data
   ══════════════════════════════════════════════ */
export interface AnalyticsData {
  registrationsByDay: { date: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  topCompaniesByOffers: { companyName: string; count: number }[];
  topUniversitiesByStudents: { universityName: string; count: number }[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  // Registrations per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const regByDay = await db
    .select({
      date: sql<string>`to_char(${users.createdAt}::date, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(users)
    .where(sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}`)
    .groupBy(sql`${users.createdAt}::date`)
    .orderBy(sql`${users.createdAt}::date`);

  // Applications by status
  const appsByStatus = await db
    .select({
      status: applications.status,
      count: count(),
    })
    .from(applications)
    .groupBy(applications.status);

  // Top 10 companies by number of offers
  const topCompanies = await db
    .select({
      companyName: companies.companyName,
      count: count(),
    })
    .from(internshipOffers)
    .innerJoin(companies, eq(internshipOffers.companyId, companies.id))
    .groupBy(companies.companyName)
    .orderBy(desc(count()))
    .limit(10);

  // Top 10 universities by number of students
  const topUnis = await db
    .select({
      universityName: sql<string>`${users.university}`,
      count: count(),
    })
    .from(users)
    .where(and(eq(users.role, 'student'), isNotNull(users.university)))
    .groupBy(users.university)
    .orderBy(desc(count()))
    .limit(10);

  return {
    registrationsByDay: regByDay.map((r) => ({ date: r.date, count: r.count })),
    applicationsByStatus: appsByStatus.map((a) => ({ status: a.status, count: a.count })),
    topCompaniesByOffers: topCompanies.map((c) => ({ companyName: c.companyName, count: c.count })),
    topUniversitiesByStudents: topUnis.map((u) => ({ universityName: u.universityName, count: u.count })),
  };
}

/* ══════════════════════════════════════════════
   Audit Logs — list recent audit events
   ══════════════════════════════════════════════ */
export interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface AuditLogResult {
  logs: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export async function listAuditLogs(opts: {
  page?: number;
  limit?: number;
  action?: string;
}): Promise<AuditLogResult> {
  const page = Math.max(opts.page ?? 1, 1);
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (opts.action) {
    conditions.push(eq(auditLogs.action, opts.action));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db.select({ value: count() }).from(auditLogs).where(where);

  const rows = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  // Enrich with actor emails
  const logs: AuditLogItem[] = [];
  for (const row of rows) {
    const [actor] = await db.select({ email: users.email }).from(users).where(eq(users.id, row.actorId));
    logs.push({
      id: row.id,
      actorId: row.actorId,
      actorEmail: actor?.email ?? 'unknown',
      actorRole: row.actorRole,
      action: row.action,
      targetId: row.targetId,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
    });
  }

  return { logs, total: totalRow.value, page, limit };
}
