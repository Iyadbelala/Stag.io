import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { companies, internshipOffers, applications } from '../model/schema';

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

export interface CompanyPublicProfile extends PublicCompany {
  offers: {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    applicationCount: number;
    createdAt: string;
  }[];
}

export async function getCompanyPublicProfile(companyId: string): Promise<CompanyPublicProfile> {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId));

  if (!company || !company.isValidated) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const offers = await db
    .select()
    .from(internshipOffers)
    .where(and(eq(internshipOffers.companyId, company.id), eq(internshipOffers.status, 'active')))
    .orderBy(desc(internshipOffers.createdAt));

  const offersWithCount = [];
  for (const o of offers) {
    const [appCount] = await db
      .select({ value: count() })
      .from(applications)
      .where(eq(applications.offerId, o.id));

    offersWithCount.push({
      id: o.id,
      title: o.title,
      location: o.location,
      type: o.type,
      duration: o.duration,
      applicationCount: appCount?.value ?? 0,
      createdAt: o.createdAt.toISOString(),
    });
  }

  const [totalActive] = await db
    .select({ value: count() })
    .from(internshipOffers)
    .where(and(eq(internshipOffers.companyId, company.id), eq(internshipOffers.status, 'active')));

  return {
    id: company.id,
    companyName: company.companyName,
    industry: company.industry,
    location: company.location,
    website: company.website,
    description: company.description,
    logoUrl: company.logoUrl,
    contactPerson: company.contactPerson,
    openPositions: totalActive?.value ?? 0,
    createdAt: company.createdAt.toISOString(),
    offers: offersWithCount,
  };
}

export async function listPublicCompanies(): Promise<PublicCompany[]> {
  const rows = await db
    .select()
    .from(companies)
    .where(eq(companies.isValidated, true))
    .orderBy(desc(companies.createdAt));

  const result: PublicCompany[] = [];
  for (const c of rows) {
    const [countRow] = await db
      .select({ value: count() })
      .from(internshipOffers)
      .where(and(eq(internshipOffers.companyId, c.id), eq(internshipOffers.status, 'active')));

    result.push({
      id: c.id,
      companyName: c.companyName,
      industry: c.industry,
      location: c.location,
      website: c.website,
      description: c.description,
      logoUrl: c.logoUrl,
      contactPerson: c.contactPerson,
      openPositions: countRow?.value ?? 0,
      createdAt: c.createdAt.toISOString(),
    });
  }

  return result;
}
