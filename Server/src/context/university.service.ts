import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { universities, users, students, applications, internshipOffers, companies } from '../model/schema';
import { sendNotification } from './notifications.service';

/* ──────────────────────────────────────────────
   University Profile
   ────────────────────────────────────────────── */
export interface UniversityProfile {
  id: string;
  universityName: string;
  domain: string;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  location: string | null;
  isValidated: boolean;
}

export async function getUniversityProfile(userId: string): Promise<UniversityProfile | null> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, userId));
  if (!uni) return null;
  return {
    id: uni.id,
    universityName: uni.universityName,
    domain: uni.domain,
    website: uni.website,
    logoUrl: uni.logoUrl,
    description: uni.description,
    location: uni.location,
    isValidated: uni.isValidated,
  };
}

export async function updateUniversityProfile(
  userId: string,
  data: Partial<Pick<UniversityProfile, 'universityName' | 'website' | 'description' | 'location'>>
): Promise<UniversityProfile | null> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, userId));
  if (!uni) return null;

  const [updated] = await db
    .update(universities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(universities.id, uni.id))
    .returning();

  return {
    id: updated.id,
    universityName: updated.universityName,
    domain: updated.domain,
    website: updated.website,
    logoUrl: updated.logoUrl,
    description: updated.description,
    location: updated.location,
    isValidated: updated.isValidated,
  };
}

/* ──────────────────────────────────────────────
   Students belonging to this university
   ────────────────────────────────────────────── */
export interface UniversityStudent {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  department: string | null;
  skills: string[];
  bio: string | null;
  cvUrl: string | null;
  profilePhotoUrl: string | null;
  portfolioPhotos: string[];
  createdAt: string;
}

export async function getUniversityStudents(userId: string): Promise<UniversityStudent[]> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, userId));
  if (!uni) return [];

  // Find all users whose email ends with this domain
  const allUsers = await db.select().from(users).where(eq(users.role, 'student'));
  const domainStudents = allUsers.filter(u => u.email.toLowerCase().endsWith(`@${uni.domain}`));

  const result: UniversityStudent[] = [];
  for (const u of domainStudents) {
    const [student] = await db.select().from(students).where(eq(students.userId, u.id));
    result.push({
      id: student?.id ?? u.id,
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      department: student?.department ?? null,
      skills: student?.skills ?? [],
      bio: student?.bio ?? null,
      cvUrl: student?.cvUrl ?? null,
      profilePhotoUrl: student?.profilePhotoUrl ?? null,
      portfolioPhotos: student?.portfolioPhotos ?? [],
      createdAt: u.createdAt.toISOString(),
    });
  }

  return result;
}

/* ──────────────────────────────────────────────
   University Dashboard Stats
   ────────────────────────────────────────────── */
export interface UniversityDashboardStats {
  totalStudents: number;
  activeInternships: number;
  pendingValidation: number;
  totalApplications: number;
  universityName: string;
  domain: string;
  isValidated: boolean;
}

export async function getUniversityDashboard(userId: string): Promise<UniversityDashboardStats | null> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, userId));
  if (!uni) return null;

  const allStudentUsers = await db.select().from(users).where(eq(users.role, 'student'));
  const domainStudentUsers = allStudentUsers.filter(u => u.email.toLowerCase().endsWith(`@${uni.domain}`));

  // Gather student profile IDs
  const studentIds: string[] = [];
  for (const u of domainStudentUsers) {
    const [s] = await db.select().from(students).where(eq(students.userId, u.id));
    if (s) studentIds.push(s.id);
  }

  // Count applications, accepted (pending uni validation), validated (active internships)
  let totalApps = 0;
  let pendingVal = 0;
  let activeIntern = 0;

  for (const sid of studentIds) {
    const apps = await db.select().from(applications).where(eq(applications.studentId, sid));
    totalApps += apps.length;
    pendingVal += apps.filter(a => a.status === 'accepted').length;
    activeIntern += apps.filter(a => a.status === 'validated').length;
  }

  return {
    totalStudents: domainStudentUsers.length,
    activeInternships: activeIntern,
    pendingValidation: pendingVal,
    totalApplications: totalApps,
    universityName: uni.universityName,
    domain: uni.domain,
    isValidated: uni.isValidated,
  };
}

/* ──────────────────────────────────────────────
   Student Applications (for a specific student)
   ────────────────────────────────────────────── */
export interface StudentApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  cvUrl: string | null;
  appliedAt: string;
  offerTitle: string;
  offerDescription: string;
  offerDuration: string;
  offerLocation: string;
  offerType: string;
  companyName: string;
  companyLogo: string | null;
}

export async function getStudentApplicationsForUniversity(
  universityUserId: string,
  studentId: string,
): Promise<StudentApplication[]> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, universityUserId));
  if (!uni) return [];

  // Get the student record, verify they belong to this university
  const [student] = await db.select().from(students).where(eq(students.id, studentId));
  if (!student) return [];
  const [studentUser] = await db.select().from(users).where(eq(users.id, student.userId));
  if (!studentUser || !studentUser.email.toLowerCase().endsWith(`@${uni.domain}`)) return [];

  const apps = await db.select().from(applications).where(eq(applications.studentId, studentId));

  const result: StudentApplication[] = [];
  for (const a of apps) {
    const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId));
    const [company] = offer
      ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
      : [undefined];

    result.push({
      id: a.id,
      status: a.status,
      coverLetter: a.coverLetter,
      cvUrl: a.cvUrl,
      appliedAt: a.appliedAt.toISOString(),
      offerTitle: offer?.title ?? '',
      offerDescription: offer?.description ?? '',
      offerDuration: offer?.duration ?? '',
      offerLocation: offer?.location ?? '',
      offerType: offer?.type ?? '',
      companyName: company?.companyName ?? '',
      companyLogo: company?.logoUrl ?? null,
    });
  }

  return result;
}

/* ──────────────────────────────────────────────
   Validate an accepted application (university approval)
   ────────────────────────────────────────────── */
export async function validateApplication(
  universityUserId: string,
  applicationId: string,
): Promise<{ id: string; status: string }> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, universityUserId));
  if (!uni) {
    const err = new Error('University not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND'; err.status = 404; throw err;
  }

  const [app] = await db.select().from(applications).where(eq(applications.id, applicationId));
  if (!app) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND'; err.status = 404; throw err;
  }

  if (app.status !== 'accepted') {
    const err = new Error('Only company-accepted applications can be validated by the university') as Error & { code: string; status: number };
    err.code = 'INVALID_STATUS'; err.status = 400; throw err;
  }

  // Verify the student belongs to this university
  const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
  if (!student) {
    const err = new Error('Student not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND'; err.status = 404; throw err;
  }
  const [studentUser] = await db.select().from(users).where(eq(users.id, student.userId));
  if (!studentUser || !studentUser.email.toLowerCase().endsWith(`@${uni.domain}`)) {
    const err = new Error('Student does not belong to this university') as Error & { code: string; status: number };
    err.code = 'FORBIDDEN'; err.status = 403; throw err;
  }

  const [updated] = await db
    .update(applications)
    .set({ status: 'validated', updatedAt: new Date() })
    .where(eq(applications.id, applicationId))
    .returning();

  // Notify the student
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
  sendNotification(
    student.userId,
    'application_status_changed',
    'Application Validated',
    `Your application for "${offer?.title ?? 'an internship'}" has been validated by your university`,
    applicationId,
  ).catch(() => {});

  return { id: updated.id, status: updated.status };
}

/* ──────────────────────────────────────────────
   Active Internships / Contracts (validated apps)
   ────────────────────────────────────────────── */
export interface ActiveInternship {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhoto: string | null;
  department: string | null;
  offerTitle: string;
  offerDuration: string;
  offerLocation: string;
  offerType: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  appliedAt: string;
}

export async function getActiveInternships(universityUserId: string): Promise<ActiveInternship[]> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, universityUserId));
  if (!uni) return [];

  const allStudentUsers = await db.select().from(users).where(eq(users.role, 'student'));
  const domainStudentUsers = allStudentUsers.filter(u => u.email.toLowerCase().endsWith(`@${uni.domain}`));

  const result: ActiveInternship[] = [];

  for (const u of domainStudentUsers) {
    const [student] = await db.select().from(students).where(eq(students.userId, u.id));
    if (!student) continue;

    // Get validated + accepted applications (contracts in progress)
    const apps = await db.select().from(applications).where(eq(applications.studentId, student.id));
    const activeApps = apps.filter(a => a.status === 'validated' || a.status === 'accepted');

    for (const a of activeApps) {
      const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId));
      const [company] = offer
        ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
        : [undefined];

      result.push({
        applicationId: a.id,
        studentId: student.id,
        studentName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
        studentEmail: u.email,
        studentPhoto: student.profilePhotoUrl,
        department: student.department,
        offerTitle: offer?.title ?? '',
        offerDuration: offer?.duration ?? '',
        offerLocation: offer?.location ?? '',
        offerType: offer?.type ?? '',
        companyName: company?.companyName ?? '',
        companyLogo: company?.logoUrl ?? null,
        status: a.status,
        appliedAt: a.appliedAt.toISOString(),
      });
    }
  }

  return result;
}

/* ──────────────────────────────────────────────
   Pending validations (accepted by company, awaiting uni)
   ────────────────────────────────────────────── */
export async function getPendingValidations(universityUserId: string): Promise<ActiveInternship[]> {
  const [uni] = await db.select().from(universities).where(eq(universities.userId, universityUserId));
  if (!uni) return [];

  const allStudentUsers = await db.select().from(users).where(eq(users.role, 'student'));
  const domainStudentUsers = allStudentUsers.filter(u => u.email.toLowerCase().endsWith(`@${uni.domain}`));

  const result: ActiveInternship[] = [];

  for (const u of domainStudentUsers) {
    const [student] = await db.select().from(students).where(eq(students.userId, u.id));
    if (!student) continue;

    const apps = await db.select().from(applications).where(eq(applications.studentId, student.id));
    const pendingApps = apps.filter(a => a.status === 'accepted');

    for (const a of pendingApps) {
      const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId));
      const [company] = offer
        ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
        : [undefined];

      result.push({
        applicationId: a.id,
        studentId: student.id,
        studentName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
        studentEmail: u.email,
        studentPhoto: student.profilePhotoUrl,
        department: student.department,
        offerTitle: offer?.title ?? '',
        offerDuration: offer?.duration ?? '',
        offerLocation: offer?.location ?? '',
        offerType: offer?.type ?? '',
        companyName: company?.companyName ?? '',
        companyLogo: company?.logoUrl ?? null,
        status: a.status,
        appliedAt: a.appliedAt.toISOString(),
      });
    }
  }

  return result;
}
