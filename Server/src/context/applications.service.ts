import { prisma } from '../model/prisma';

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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });

  if (!user || !user.student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // 2. Verify the offer exists and is active
  const offer = await prisma.internshipOffer.findUnique({
    where: { id: offerId },
    include: { company: { select: { companyName: true } } },
  });

  if (!offer || offer.status !== 'active') {
    const err = new Error('Internship offer not found or no longer active') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // 3. Check for duplicate application
  const existing = await prisma.application.findFirst({
    where: { studentId: user.student.id, offerId },
  });

  if (existing) {
    const err = new Error('You have already applied to this internship') as Error & { code: string; status: number };
    err.code = 'DUPLICATE';
    err.status = 409;
    throw err;
  }

  // 4. Create the application
  const application = await prisma.application.create({
    data: {
      studentId: user.student.id,
      offerId,
      coverLetter: input.coverLetter ?? null,
      cvUrl: input.cvUrl ?? null,
    },
    include: {
      offer: {
        include: { company: { select: { companyName: true } } },
      },
    },
  });

  return {
    id: application.id,
    studentId: application.studentId,
    offerId: application.offerId,
    coverLetter: application.coverLetter,
    cvUrl: application.cvUrl,
    status: application.status,
    appliedAt: application.appliedAt.toISOString(),
    offerTitle: application.offer.title,
    companyName: application.offer.company.companyName,
  };
}

/**
 * Get all applications for a student.
 */
export async function getStudentApplications(userId: string): Promise<ApplicationResult[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });

  if (!user || !user.student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const applications = await prisma.application.findMany({
    where: { studentId: user.student.id },
    include: {
      offer: {
        include: { company: { select: { companyName: true } } },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications.map((a) => ({
    id: a.id,
    studentId: a.studentId,
    offerId: a.offerId,
    coverLetter: a.coverLetter,
    cvUrl: a.cvUrl,
    status: a.status,
    appliedAt: a.appliedAt.toISOString(),
    offerTitle: a.offer.title,
    companyName: a.offer.company.companyName,
  }));
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user || !user.company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { offer: true },
  });

  if (!application || application.offer.companyId !== user.company.id) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  return { id: updated.id, status: updated.status };
}
