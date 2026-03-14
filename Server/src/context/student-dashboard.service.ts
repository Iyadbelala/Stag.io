import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { users, students, companies, internshipOffers, applications } from '../model/schema';

export interface StudentDashboardStats {
  applicationsSent: number;
  acceptedApplications: number;
  pendingResponses: number;
  rejectedApplications: number;
}

export interface RecentApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  appliedAt: string;
}

export interface StudentDashboardData {
  stats: StudentDashboardStats;
  recentApplications: RecentApplication[];
  profileCompletion: number;
  missingFields: string[];
}

export async function getStudentDashboard(userId: string): Promise<StudentDashboardData> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  if (!user || !student) {
    const err = new Error('Student not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const studentId = student.id;

  // Get stats
  const [[sent], [accepted], [pending], [rejected]] = await Promise.all([
    db.select({ value: count() }).from(applications).where(eq(applications.studentId, studentId)),
    db.select({ value: count() }).from(applications).where(and(eq(applications.studentId, studentId), eq(applications.status, 'accepted'))),
    db.select({ value: count() }).from(applications).where(and(eq(applications.studentId, studentId), eq(applications.status, 'pending'))),
    db.select({ value: count() }).from(applications).where(and(eq(applications.studentId, studentId), eq(applications.status, 'rejected'))),
  ]);

  // Get recent applications (latest 5)
  const recentApps = await db
    .select()
    .from(applications)
    .where(eq(applications.studentId, studentId))
    .orderBy(desc(applications.appliedAt))
    .limit(5);

  const recentApplications: RecentApplication[] = [];
  for (const app of recentApps) {
    const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
    const [company] = offer
      ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
      : [undefined];

    recentApplications.push({
      id: app.id,
      title: offer?.title ?? '',
      company: company?.companyName ?? '',
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
    });
  }

  // Compute profile completion
  const fieldChecks: { label: string; value: unknown }[] = [
    { label: 'first name', value: user.firstName },
    { label: 'last name', value: user.lastName },
    { label: 'university', value: user.university },
    { label: 'department', value: student.department },
    { label: 'bio', value: student.bio },
    { label: 'profile photo', value: student.profilePhotoUrl },
    { label: 'skills', value: student.skills.length > 0 ? 'has_skills' : null },
    { label: 'portfolio', value: student.portfolioPhotos.length > 0 ? 'has_portfolio' : null },
  ];
  const isFilled = (v: unknown) => v && (typeof v !== 'string' || v.trim().length > 0);
  const filledCount = fieldChecks.filter((f) => isFilled(f.value)).length;
  const profileCompletion = Math.round((filledCount / fieldChecks.length) * 100);
  const missingFields = fieldChecks.filter((f) => !isFilled(f.value)).map((f) => f.label);

  return {
    stats: {
      applicationsSent: sent.value,
      acceptedApplications: accepted.value,
      pendingResponses: pending.value,
      rejectedApplications: rejected.value,
    },
    recentApplications,
    profileCompletion,
    missingFields,
  };
}
