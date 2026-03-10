import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../model/db';
import { companies, internshipOffers } from '../model/schema';

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
