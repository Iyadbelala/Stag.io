import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { students, users, internshipOffers, companies } from '../model/schema';

/* ── Normalize helper ── */
export function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── Tokenize text into meaningful words ── */
export function tokenize(text: string): string[] {
  return norm(text).split(' ').filter(w => w.length > 1);
}

/* ── Skill matching (50% weight) ── */
export function scoreSkills(
  studentSkills: string[],
  requirements: string,
  description: string,
): { score: number; matchedSkills: string[] } {
  if (studentSkills.length === 0) return { score: 0, matchedSkills: [] };

  const offerText = norm(requirements + ' ' + description);
  const matchedSkills: string[] = [];
  let totalWeight = 0;

  for (const skill of studentSkills) {
    const skillNorm = norm(skill);
    // Exact match (full skill name in text)
    if (offerText.includes(skillNorm)) {
      matchedSkills.push(skill);
      totalWeight += 1.0;
    } else {
      // Partial: check each word of multi-word skills
      const words = skillNorm.split(' ');
      const partialHits = words.filter(w => w.length > 2 && offerText.includes(w));
      if (partialHits.length > 0) {
        const ratio = partialHits.length / words.length;
        if (ratio >= 0.5) {
          matchedSkills.push(skill);
          totalWeight += ratio * 0.7;
        }
      }
    }
  }

  // Count the offer's required skills to measure how well the student covers the offer
  const reqTokens = requirements.split(/[,;/\n]+/).map(t => t.trim()).filter(t => t.length > 1);
  const reqCount = Math.max(reqTokens.length, 1);

  // Normalize by the smaller set — student shouldn't be penalized for having more skills than required
  const normFactor = Math.min(reqCount, studentSkills.length);
  const score = matchedSkills.length > 0 ? Math.min(totalWeight / normFactor, 1.0) : 0;
  return { score, matchedSkills };
}

/* ── Department-to-industry relevance map (25% weight) ── */
export const DEPT_KEYWORDS: Record<string, string[]> = {
  'computer science': ['software', 'web', 'mobile', 'data', 'cloud', 'devops', 'ai', 'machine learning', 'full stack', 'frontend', 'backend', 'developer', 'engineer', 'programming', 'it', 'tech', 'digital', 'cyber', 'security', 'database', 'api'],
  'information technology': ['software', 'web', 'it', 'network', 'system', 'admin', 'cloud', 'devops', 'tech', 'digital', 'support', 'infrastructure', 'database'],
  'electrical engineering': ['electronics', 'embedded', 'iot', 'hardware', 'circuit', 'power', 'automation', 'control', 'signal', 'telecom', 'firmware'],
  'mechanical engineering': ['manufacturing', 'cad', 'design', 'automotive', 'production', 'maintenance', 'industrial', 'mechanical', 'quality'],
  'civil engineering': ['construction', 'infrastructure', 'structural', 'building', 'urban', 'architecture', 'planning', 'surveying'],
  'business': ['management', 'marketing', 'finance', 'sales', 'consulting', 'strategy', 'business', 'accounting', 'project', 'operations', 'hr', 'human resources'],
  'marketing': ['marketing', 'digital', 'social media', 'content', 'seo', 'advertising', 'brand', 'communication', 'pr', 'analytics', 'campaign'],
  'finance': ['finance', 'accounting', 'banking', 'audit', 'tax', 'investment', 'risk', 'treasury', 'budget', 'financial'],
  'medicine': ['health', 'medical', 'hospital', 'clinical', 'pharmaceutical', 'patient', 'care', 'biomedical', 'healthcare'],
  'pharmacy': ['pharmaceutical', 'drug', 'clinical', 'lab', 'research', 'chemistry', 'health', 'pharmacy'],
  'law': ['legal', 'law', 'compliance', 'regulatory', 'contract', 'governance', 'policy', 'justice'],
  'architecture': ['architecture', 'design', 'building', 'urban', 'planning', 'cad', 'construction', 'interior'],
  'biology': ['biology', 'biotech', 'lab', 'research', 'genetics', 'environment', 'ecology', 'pharmaceutical'],
  'chemistry': ['chemistry', 'chemical', 'lab', 'research', 'pharmaceutical', 'material', 'quality', 'analysis'],
  'mathematics': ['data', 'analytics', 'statistics', 'modeling', 'research', 'algorithm', 'quantitative', 'actuarial'],
  'communications': ['media', 'journalism', 'communication', 'content', 'public relations', 'writing', 'editorial', 'broadcasting'],
  'design': ['design', 'ui', 'ux', 'graphic', 'creative', 'visual', 'branding', 'illustration', 'figma', 'adobe'],
};

export function scoreDepartment(department: string | null, offerText: string, industry: string | null): number {
  if (!department) return 0.3; // Neutral score when no department

  const deptNorm = norm(department);
  const textNorm = norm(offerText + ' ' + (industry ?? ''));

  // Find best matching department key
  let bestMatch = 0;
  for (const [deptKey, keywords] of Object.entries(DEPT_KEYWORDS)) {
    // Check if student department matches this key (exact or partial)
    if (deptNorm.includes(deptKey) || deptKey.includes(deptNorm) || deptNorm.split(' ').some(w => deptKey.includes(w))) {
      const hits = keywords.filter(kw => textNorm.includes(kw));
      const relevance = hits.length / keywords.length;
      bestMatch = Math.max(bestMatch, relevance);
    }
  }

  // Fallback: check if department name words appear in offer text
  if (bestMatch === 0) {
    const deptWords = tokenize(department);
    const hits = deptWords.filter(w => w.length > 3 && textNorm.includes(w));
    bestMatch = deptWords.length > 0 ? (hits.length / deptWords.length) * 0.5 : 0;
  }

  return Math.min(bestMatch * 1.5, 1.0); // Amplify to make department match meaningful
}

/* ── Location matching (15% weight) ── */
export function scoreLocation(studentUniversity: string | null, offerLocation: string, companyLocation: string | null): number {
  if (!studentUniversity) return 0.3;

  const uniNorm = norm(studentUniversity);
  const offerLoc = norm(offerLocation);
  const compLoc = norm(companyLocation ?? '');

  // Extract city-like words from university (e.g., "univ-constantine3.dz" → "constantine")
  const uniWords = uniNorm.replace(/[0-9.]/g, ' ').split(/[\s-]+/).filter(w => w.length > 3);

  for (const word of uniWords) {
    if (offerLoc.includes(word) || compLoc.includes(word)) return 1.0;
  }

  // Check for "remote" — remote offers are location-agnostic
  if (offerLoc.includes('remote')) return 0.7;

  return 0.1;
}

/* ── Title relevance to student skills (10% weight) ── */
export function scoreTitleRelevance(studentSkills: string[], title: string): number {
  if (studentSkills.length === 0) return 0.2;

  const titleNorm = norm(title);
  let hits = 0;

  for (const skill of studentSkills) {
    const skillWords = norm(skill).split(' ');
    if (skillWords.some(w => w.length > 2 && titleNorm.includes(w))) {
      hits++;
    }
  }

  return Math.min(hits / Math.min(studentSkills.length, 3), 1.0);
}

/* ── Public types ── */
export interface MatchedOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  bannerUrl: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  companyIndustry: string | null;
  companyLocation: string | null;
  matchScore: number;
  matchedSkills: string[];
}

/* ── Main matching function ── */
export async function getSmartMatches(userId: string, limit: number = 10): Promise<MatchedOffer[]> {
  // 1. Get student profile + user info (for university)
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  if (!student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  // 2. Get all active offers
  const offers = await db
    .select({
      id: internshipOffers.id,
      title: internshipOffers.title,
      description: internshipOffers.description,
      requirements: internshipOffers.requirements,
      duration: internshipOffers.duration,
      location: internshipOffers.location,
      type: internshipOffers.type,
      bannerUrl: internshipOffers.bannerUrl,
      companyId: internshipOffers.companyId,
    })
    .from(internshipOffers)
    .where(eq(internshipOffers.status, 'active'));

  if (offers.length === 0) return [];

  // 3. Get company info
  const companyIds = [...new Set(offers.map(o => o.companyId))];
  const companyRows = await Promise.all(
    companyIds.map(id => db.select().from(companies).where(eq(companies.id, id)).then(r => r[0]))
  );
  const companyMap = new Map(companyRows.filter(Boolean).map(c => [c!.id, c!]));

  // 4. Score each offer
  const scored = offers.map(offer => {
    const company = companyMap.get(offer.companyId);
    const offerFullText = offer.title + ' ' + offer.description + ' ' + offer.requirements;

    // Individual scores
    const { score: skillScore, matchedSkills } = scoreSkills(student.skills, offer.requirements, offer.description);
    const deptScore = scoreDepartment(student.department, offerFullText, company?.industry ?? null);
    const locScore = scoreLocation(user?.university ?? null, offer.location, company?.location ?? null);
    const titleScore = scoreTitleRelevance(student.skills, offer.title);

    // Weighted final score: skills 50%, department 25%, location 15%, title 10%
    const finalScore = (0.50 * skillScore) + (0.25 * deptScore) + (0.15 * locScore) + (0.10 * titleScore);

    return {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      requirements: offer.requirements,
      duration: offer.duration,
      location: offer.location,
      type: offer.type,
      bannerUrl: offer.bannerUrl ?? null,
      companyName: company?.companyName ?? '',
      companyLogoUrl: company?.logoUrl ?? null,
      companyIndustry: company?.industry ?? null,
      companyLocation: company?.location ?? null,
      matchScore: Math.round(finalScore * 100),
      matchedSkills,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}
