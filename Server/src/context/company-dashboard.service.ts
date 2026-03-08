import { prisma } from '../model/prisma';

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
}

export async function getCompanyDashboard(userId: string): Promise<CompanyDashboardData> {
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

  const companyId = user.company.id;

  // Get stats
  const [activeListings, totalOffers, applicationsReceived, acceptedApplications] = await Promise.all([
    prisma.internshipOffer.count({
      where: { companyId, status: 'active' },
    }),
    prisma.internshipOffer.count({
      where: { companyId },
    }),
    prisma.application.count({
      where: { offer: { companyId } },
    }),
    prisma.application.count({
      where: { offer: { companyId }, status: 'accepted' },
    }),
  ]);

  // Get recent applicants (latest 5)
  const recentApplications = await prisma.application.findMany({
    where: { offer: { companyId } },
    orderBy: { appliedAt: 'desc' },
    take: 5,
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      offer: { select: { title: true } },
    },
  });

  const recentApplicants: RecentApplicant[] = recentApplications.map((app) => ({
    id: app.id,
    applicantName:
      app.student.user.firstName && app.student.user.lastName
        ? `${app.student.user.firstName} ${app.student.user.lastName}`
        : app.student.user.email,
    position: app.offer.title,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    coverLetter: app.coverLetter,
    cvUrl: app.cvUrl,
    email: app.student.user.email,
  }));

  // Compute profile completion
  const company = user.company;
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
      activeListings,
      applicationsReceived,
      acceptedApplications,
      totalOffers,
    },
    recentApplicants,
    profileCompletion,
  };
}
