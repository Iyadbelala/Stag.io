import { prisma } from '../model/prisma';

export interface PublicCompany {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  contactPerson: string | null;
  openPositions: number;
  createdAt: string;
}

export async function listPublicCompanies(): Promise<PublicCompany[]> {
  const companies = await prisma.company.findMany({
    where: { isValidated: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          offers: { where: { status: 'active' } },
        },
      },
    },
  });

  return companies.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    industry: c.industry,
    location: c.location,
    website: c.website,
    description: c.description,
    logoUrl: c.logoUrl,
    contactPerson: c.contactPerson,
    openPositions: c._count.offers,
    createdAt: c.createdAt.toISOString(),
  }));
}
