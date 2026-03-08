import { prisma } from '../model/prisma';

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
}

export async function getStudentDashboard(userId: string): Promise<StudentDashboardData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });

  if (!user || !user.student) {
    const err = new Error('Student not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const studentId = user.student.id;

  // Get stats
  const [applicationsSent, acceptedApplications, pendingResponses, rejectedApplications] = await Promise.all([
    prisma.application.count({
      where: { studentId },
    }),
    prisma.application.count({
      where: { studentId, status: 'accepted' },
    }),
    prisma.application.count({
      where: { studentId, status: 'pending' },
    }),
    prisma.application.count({
      where: { studentId, status: 'rejected' },
    }),
  ]);

  // Get recent applications (latest 5)
  const applications = await prisma.application.findMany({
    where: { studentId },
    orderBy: { appliedAt: 'desc' },
    take: 5,
    include: {
      offer: {
        include: {
          company: { select: { companyName: true } },
        },
      },
    },
  });

  const recentApplications: RecentApplication[] = applications.map((app) => ({
    id: app.id,
    title: app.offer.title,
    company: app.offer.company.companyName,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
  }));

  // Compute profile completion
  const student = user.student;
  const fields = [
    user.firstName,
    user.lastName,
    user.university,
    student.department,
    student.bio,
    student.cvUrl,
    student.skills.length > 0 ? 'has_skills' : null,
  ];
  const filledCount = fields.filter((f) => f && (typeof f !== 'string' || f.trim().length > 0)).length;
  const profileCompletion = Math.round((filledCount / fields.length) * 100);

  return {
    stats: {
      applicationsSent,
      acceptedApplications,
      pendingResponses,
      rejectedApplications,
    },
    recentApplications,
    profileCompletion,
  };
}
