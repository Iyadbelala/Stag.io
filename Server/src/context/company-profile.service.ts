import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies } from '../model/schema';

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
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));

  if (!user || !company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyName: company.companyName,
    industry: company.industry,
    website: company.website,
    logoUrl: company.logoUrl,
    description: company.description,
    location: company.location,
    contactPerson: company.contactPerson,
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

  if (Object.keys(companyUpdate).length > 0) {
    await db.update(companies).set(companyUpdate).where(eq(companies.userId, userId));
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [company] = await db.select().from(companies).where(eq(companies.userId, userId));

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyName: company.companyName,
    industry: company.industry,
    website: company.website,
    logoUrl: company.logoUrl,
    description: company.description,
    location: company.location,
    contactPerson: company.contactPerson,
    createdAt: user.createdAt,
  };
}
