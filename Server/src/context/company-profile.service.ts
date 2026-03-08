import { prisma } from '../model/prisma';

export interface CompanyProfile {
  id: string;
  email: string;
  role: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  location: string | null;
  contactPerson: string | null;
  createdAt: Date;
}

export interface UpdateCompanyProfileInput {
  companyName?: string;
  industry?: string;
  website?: string;
  description?: string;
  location?: string;
  contactPerson?: string;
}

export async function getCompanyProfile(userId: string): Promise<CompanyProfile> {
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

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyName: user.company.companyName,
    industry: user.company.industry,
    website: user.company.website,
    logoUrl: user.company.logoUrl,
    description: user.company.description,
    location: user.company.location,
    contactPerson: user.company.contactPerson,
    createdAt: user.createdAt,
  };
}

export async function updateCompanyProfile(
  userId: string,
  input: UpdateCompanyProfileInput
): Promise<CompanyProfile> {
  const companyUpdate: Record<string, unknown> = {};
  if (input.companyName !== undefined) companyUpdate.companyName = input.companyName;
  if (input.industry !== undefined) companyUpdate.industry = input.industry;
  if (input.website !== undefined) companyUpdate.website = input.website;
  if (input.description !== undefined) companyUpdate.description = input.description;
  if (input.location !== undefined) companyUpdate.location = input.location;
  if (input.contactPerson !== undefined) companyUpdate.contactPerson = input.contactPerson;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      company: { update: companyUpdate },
    },
    include: { company: true },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyName: user.company!.companyName,
    industry: user.company!.industry,
    website: user.company!.website,
    logoUrl: user.company!.logoUrl,
    description: user.company!.description,
    location: user.company!.location,
    contactPerson: user.company!.contactPerson,
    createdAt: user.createdAt,
  };
}
