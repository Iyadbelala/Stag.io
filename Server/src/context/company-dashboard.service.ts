import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, students, internshipOffers, applications } from '../model/schema';

export interface DashboardStats {
  activeListings: number;
  applicationsReceived: number;
  acceptedApplications: number;
  totalOffers: number;
}

export interface RecentApplicant {
  id: string;
  applicantName: string;
  position: string;
  status: string;
  appliedAt: string;
  coverLetter: string | null;
  cvUrl: string | null;
  email: string;
}

export interface CompanyDashboardData {
  stats: DashboardStats;
  recentApplicants: RecentApplicant[];
  profileCompletion: number;
  isValidated: boolean;
}

export async function getCompanyDashboard(userId: string): Promise<CompanyDashboardData> {
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const companyId = company.id;

  // Get all offer IDs for this company
  const offerRows = await db.select({ id: internshipOffers.id }).from(internshipOffers).where(eq(internshipOffers.companyId, companyId));
  const offerIds = offerRows.map((o) => o.id);

  // Get stats
  const [activeCount] = await db.select({ value: count() }).from(internshipOffers).where(and(eq(internshipOffers.companyId, companyId), eq(internshipOffers.status, 'active')));
  const [totalCount] = await db.select({ value: count() }).from(internshipOffers).where(eq(internshipOffers.companyId, companyId));

  let appsReceived = 0;
  let appsAccepted = 0;
  if (offerIds.length > 0) {
    for (const oid of offerIds) {
      const [r] = await db.select({ value: count() }).from(applications).where(eq(applications.offerId, oid));
      appsReceived += r.value;
      const [a] = await db.select({ value: count() }).from(applications).where(and(eq(applications.offerId, oid), eq(applications.status, 'accepted')));
      appsAccepted += a.value;
    }
  }

  // Get recent applicants (latest 5)
  const recentApplicants: RecentApplicant[] = [];
  if (offerIds.length > 0) {
    // Get all applications for this company's offers, sorted by date
    const allApps: (typeof applications.$inferSelect)[] = [];
    for (const oid of offerIds) {
      const apps = await db.select().from(applications).where(eq(applications.offerId, oid));
      allApps.push(...apps);
    }
    allApps.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
    const top5 = allApps.slice(0, 5);

    for (const app of top5) {
      const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
      const [studentUser] = student
        ? await db.select().from(users).where(eq(users.id, student.userId))
        : [undefined];
      const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));

      recentApplicants.push({
        id: app.id,
        applicantName:
          studentUser?.firstName && studentUser?.lastName
            ? `${studentUser.firstName} ${studentUser.lastName}`
            : studentUser?.email ?? '',
        position: offer?.title ?? '',
        status: app.status,
        appliedAt: app.appliedAt.toISOString(),
        coverLetter: app.coverLetter,
        cvUrl: app.cvUrl,
        email: studentUser?.email ?? '',
      });
    }
  }

  // Compute profile completion
  const fields = [
    company.companyName,
    company.industry,
    company.website,
    company.description,
    company.location,
    company.contactPerson,
  ];
  const filledCount = fields.filter((f) => f && f.trim().length > 0).length;
  const profileCompletion = Math.round((filledCount / fields.length) * 100);

  return {
    stats: {
      activeListings: activeCount.value,
      applicationsReceived: appsReceived,
      acceptedApplications: appsAccepted,
      totalOffers: totalCount.value,
    },
    recentApplicants,
    profileCompletion,
    isValidated: company.isValidated,
  };
}
