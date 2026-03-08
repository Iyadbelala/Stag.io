import { prisma } from '../model/prisma';

export interface CreateOfferInput {
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
}

export interface OfferResult {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  companyId: string;
  companyName: string;
  companyIndustry: string | null;
  companyLocation: string | null;
  applicationCount: number;
  createdAt: string;
}

export async function createOffer(userId: string, input: CreateOfferInput): Promise<OfferResult> {
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

  const offer = await prisma.internshipOffer.create({
    data: {
      companyId: user.company.id,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      duration: input.duration,
      location: input.location,
      type: input.type,
    },
    include: {
      company: { select: { companyName: true, industry: true, location: true } },
      _count: { select: { applications: true } },
    },
  });

  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type,
    status: offer.status,
    companyId: offer.companyId,
    companyName: offer.company.companyName,
    companyIndustry: offer.company.industry,
    companyLocation: offer.company.location,
    applicationCount: offer._count.applications,
    createdAt: offer.createdAt.toISOString(),
  };
}

export async function getCompanyOffers(userId: string): Promise<OfferResult[]> {
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

  const offers = await prisma.internshipOffer.findMany({
    where: { companyId: user.company.id },
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { companyName: true, industry: true, location: true } },
      _count: { select: { applications: true } },
    },
  });

  return offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type,
    status: offer.status,
    companyId: offer.companyId,
    companyName: offer.company.companyName,
    companyIndustry: offer.company.industry,
    companyLocation: offer.company.location,
    applicationCount: offer._count.applications,
    createdAt: offer.createdAt.toISOString(),
  }));
}

export async function updateOffer(
  userId: string,
  offerId: string,
  input: Partial<CreateOfferInput>,
): Promise<OfferResult> {
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

  const existing = await prisma.internshipOffer.findFirst({
    where: { id: offerId, companyId: user.company.id },
  });

  if (!existing) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const offer = await prisma.internshipOffer.update({
    where: { id: offerId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.requirements !== undefined && { requirements: input.requirements }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.type !== undefined && { type: input.type }),
    },
    include: {
      company: { select: { companyName: true, industry: true, location: true } },
      _count: { select: { applications: true } },
    },
  });

  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type,
    status: offer.status,
    companyId: offer.companyId,
    companyName: offer.company.companyName,
    companyIndustry: offer.company.industry,
    companyLocation: offer.company.location,
    applicationCount: offer._count.applications,
    createdAt: offer.createdAt.toISOString(),
  };
}

export async function deleteOffer(userId: string, offerId: string): Promise<void> {
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

  const offer = await prisma.internshipOffer.findFirst({
    where: { id: offerId, companyId: user.company.id },
  });

  if (!offer) {
    const err = new Error('Offer not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  await prisma.internshipOffer.delete({ where: { id: offerId } });
}

export async function listPublicOffers(): Promise<OfferResult[]> {
  const offers = await prisma.internshipOffer.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { companyName: true, industry: true, location: true } },
      _count: { select: { applications: true } },
    },
  });

  return offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type,
    status: offer.status,
    companyId: offer.companyId,
    companyName: offer.company.companyName,
    companyIndustry: offer.company.industry,
    companyLocation: offer.company.location,
    applicationCount: offer._count.applications,
    createdAt: offer.createdAt.toISOString(),
  }));
}
