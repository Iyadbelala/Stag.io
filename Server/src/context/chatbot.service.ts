import { eq, ilike, and } from 'drizzle-orm';
import { db } from '../model/db';
import { students, users, internshipOffers, companies, applications } from '../model/schema';
import { getSmartMatches } from './matching.service';

/* ══════════════════════════════════════════════════════════════
   Stag.io AI Chatbot — Algorithmic NLP Engine
   ─────────────────────────────────────────────────────────────
   Intent detection → Entity extraction → DB query → Response
   Zero external API dependencies
   ══════════════════════════════════════════════════════════════ */

/* ── Types ── */
export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[];
  data?: unknown;
}

interface ExtractedEntities {
  skills: string[];
  location: string | null;
  type: 'remote' | 'onsite' | 'hybrid' | null;
  companyName: string | null;
  duration: string | null;
}

/* ── Intent definitions ── */
type Intent =
  | 'search_offers'
  | 'recommend_offers'
  | 'my_applications'
  | 'my_profile'
  | 'company_info'
  | 'how_to_apply'
  | 'help'
  | 'greeting'
  | 'thanks'
  | 'unknown';

/* ── Normalize helper ── */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿç+#]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ══════════════════════════════════════════
   1. INTENT DETECTION
   ══════════════════════════════════════════ */

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(hi|hello|hey|bonjour|salut|salam|good\s*(morning|afternoon|evening))/i,
      /^(yo|what'?s\s*up|sup)/i,
    ],
  },
  {
    intent: 'thanks',
    patterns: [
      /\b(thank|thanks|merci|shukran|thx)\b/i,
    ],
  },
  {
    intent: 'recommend_offers',
    patterns: [
      /\b(recommend|suggestion|suggest|best\s*(for me|match|fit)|smartmatch|what.*(should|could)\s*i\s*(apply|do))\b/i,
      /\b(personali[sz]ed|for\s*me|my\s*match|suited|suitable)\b/i,
      /\b(quoi\s*postuler|recommand|conseill)/i,
    ],
  },
  {
    intent: 'search_offers',
    patterns: [
      /\b(search|find|look\s*for|show|list|browse|any|available)\b.*\b(internship|offer|stage|job|position|opportunit)/i,
      /\b(internship|offer|stage|job|position|opportunit)\b.*\b(in|at|about|for|with|near)\b/i,
      /\b(remote|onsite|on.site|hybrid)\b.*\b(internship|offer|stage|job|position)/i,
      /\b(internship|offer|stage|job)s?\b.*\b(remote|onsite|hybrid)\b/i,
      /\b(cherche|recherche|trouver)\b.*\b(stage|offre)/i,
    ],
  },
  {
    intent: 'my_applications',
    patterns: [
      /\b(my|mes)\b.*\b(application|candidature|applied|postul)/i,
      /\b(application|candidature)\b.*\b(status|state|état|suivi)\b/i,
      /\b(did\s*i\s*apply|where\s*did\s*i|track|follow\s*up)\b/i,
    ],
  },
  {
    intent: 'my_profile',
    patterns: [
      /\b(my|mon|ma)\b.*\b(profile|profil|skills|compétence|info)\b/i,
      /\b(profile|profil)\b.*\b(complete|complet|update|missing)\b/i,
    ],
  },
  {
    intent: 'company_info',
    patterns: [
      /\b(tell|info|about|know)\b.*\b(company|compan|entreprise|société)\b/i,
      /\b(company|entreprise)\b.*\b(called|named|nommé)\b/i,
      /\b(who\s*is|what\s*is)\b.*\b(company|compan)\b/i,
    ],
  },
  {
    intent: 'how_to_apply',
    patterns: [
      /\b(how)\b.*\b(apply|postuler|candidat)\b/i,
      /\b(steps|process|procedure)\b.*\b(apply|application|candidat)\b/i,
      /\b(comment)\b.*\b(postuler|candidater)\b/i,
    ],
  },
  {
    intent: 'help',
    patterns: [
      /\b(help|aide|what\s*can\s*you\s*do|capabilities|features|commands)\b/i,
      /\b(how\s*does\s*this\s*work|que\s*peux.tu\s*faire)\b/i,
    ],
  },
];

function detectIntent(message: string): Intent {
  const text = norm(message);
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text) || pattern.test(message)) {
        return intent;
      }
    }
  }
  // Fallback: check for skill-like keywords that imply offer search
  const SKILL_HINTS = ['react', 'node', 'python', 'java', 'angular', 'vue', 'flutter', 'design', 'marketing', 'finance', 'data', 'ai', 'machine learning', 'devops', 'cloud', 'mobile', 'web', 'backend', 'frontend', 'full stack', 'fullstack'];
  if (SKILL_HINTS.some(s => text.includes(s))) {
    return 'search_offers';
  }
  return 'unknown';
}

/* ══════════════════════════════════════════
   2. ENTITY EXTRACTION
   ══════════════════════════════════════════ */

const KNOWN_SKILLS = [
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular', 'svelte',
  'node', 'node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'laravel',
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin',
  'html', 'css', 'tailwind', 'bootstrap', 'sass',
  'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'supabase',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'devops', 'git',
  'figma', 'adobe', 'photoshop', 'illustrator', 'ui/ux', 'ux', 'ui',
  'machine learning', 'deep learning', 'ai', 'data science', 'nlp', 'computer vision',
  'flutter', 'react native', 'mobile', 'android', 'ios',
  'marketing', 'seo', 'social media', 'content', 'copywriting',
  'finance', 'accounting', 'audit', 'banking',
  'project management', 'agile', 'scrum',
  'cybersecurity', 'pentesting', 'network', 'linux',
  'blockchain', 'web3', 'solidity',
];

const ALGERIAN_CITIES = [
  'algiers', 'alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'djelfa',
  'sétif', 'setif', 'sidi bel abbès', 'sidi bel abbes', 'biskra', 'tébessa', 'tebessa',
  'tlemcen', 'béjaïa', 'bejaia', 'tiaret', 'tizi ouzou', 'jijel', 'skikda',
  'mostaganem', 'médéa', 'medea', 'chlef', 'msila', 'bouira', 'mascara',
];

function extractEntities(message: string): ExtractedEntities {
  const text = norm(message);

  // Extract skills
  const skills: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    if (text.includes(skill) && !skills.includes(skill)) {
      skills.push(skill);
    }
  }

  // Extract location
  let location: string | null = null;
  for (const city of ALGERIAN_CITIES) {
    if (text.includes(city)) {
      location = city;
      break;
    }
  }

  // Extract offer type
  let type: 'remote' | 'onsite' | 'hybrid' | null = null;
  if (/\b(remote|à distance|télétravail)\b/i.test(text)) type = 'remote';
  else if (/\b(on.?site|sur\s*place|présentiel|presentiel)\b/i.test(text)) type = 'onsite';
  else if (/\b(hybrid|hybride)\b/i.test(text)) type = 'hybrid';

  // Extract company name (after "at", "from", "chez", "company")
  let companyName: string | null = null;
  const companyMatch = message.match(/\b(?:at|from|chez|company|entreprise)\s+["']?([A-Z][a-zA-Z\s&.-]+)/);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  }

  // Extract duration
  let duration: string | null = null;
  const durMatch = message.match(/(\d+)\s*(month|months|mois|week|weeks|semaine)/i);
  if (durMatch) {
    duration = durMatch[0];
  }

  return { skills, location, type, companyName, duration };
}

/* ══════════════════════════════════════════
   3. RESPONSE HANDLERS
   ══════════════════════════════════════════ */

async function handleGreeting(userId: string | null): Promise<ChatResponse> {
  let name = '';
  if (userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user?.firstName) name = ` ${user.firstName}`;
  }
  return {
    reply: `Hello${name}! I'm Stag, your internship assistant. I can help you find internships, get personalized recommendations, track your applications, and more. What would you like to do?`,
    suggestions: [
      'Recommend internships for me',
      'Search for remote internships',
      'Show my applications',
      'How do I apply?',
    ],
  };
}

function handleThanks(): ChatResponse {
  return {
    reply: "You're welcome! Feel free to ask me anything else about internships. I'm here to help!",
    suggestions: ['Search internships', 'My applications', 'Recommend offers'],
  };
}

function handleHelp(): ChatResponse {
  return {
    reply: `Here's what I can do for you:\n\n• **Search internships** — "Find React internships in Constantine"\n• **Get recommendations** — "Recommend internships for me" (uses SmartMatch®)\n• **Track applications** — "Show my applications"\n• **View your profile** — "Show my profile"\n• **Learn about companies** — "Tell me about company X"\n• **Application guide** — "How do I apply?"\n\nTry asking me anything!`,
    suggestions: [
      'Find remote internships',
      'Recommend offers for me',
      'Show my applications',
      'How do I apply?',
    ],
  };
}

function handleHowToApply(): ChatResponse {
  return {
    reply: `Here's how to apply for internships on Stag.io:\n\n1. **Complete your profile** — Add your skills, department, bio, and upload your CV\n2. **Browse offers** — Go to the Internships page to see all active offers\n3. **Use SmartMatch®** — Toggle it on to see offers ranked by how well they match your profile\n4. **Apply** — Click on an offer and hit "Apply". You can add a cover letter\n5. **Track** — Check your applications page to see their status (pending, accepted, rejected)\n\nMake sure your profile is complete for the best SmartMatch® results!`,
    suggestions: ['Show my profile', 'Search internships', 'Recommend offers for me'],
  };
}

interface OfferRow {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  companyId: string;
}

interface CompanyRow {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
}

async function handleSearchOffers(entities: ExtractedEntities): Promise<ChatResponse> {
  // Build query for active offers
  let allOffers: OfferRow[] = await db
    .select({
      id: internshipOffers.id,
      title: internshipOffers.title,
      description: internshipOffers.description,
      requirements: internshipOffers.requirements,
      duration: internshipOffers.duration,
      location: internshipOffers.location,
      type: internshipOffers.type,
      companyId: internshipOffers.companyId,
    })
    .from(internshipOffers)
    .where(eq(internshipOffers.status, 'active'));

  // Get company info
  const companyIds = [...new Set(allOffers.map((o: OfferRow) => o.companyId))];
  const companyRows = (await Promise.all(
    companyIds.map(id => db.select().from(companies).where(eq(companies.id, id)).then((r: unknown[]) => r[0]))
  )) as (CompanyRow | undefined)[];
  const companyMap = new Map<string, CompanyRow>();
  for (const c of companyRows) {
    if (c) companyMap.set(c.id, c);
  }

  // Filter by type
  if (entities.type) {
    allOffers = allOffers.filter((o: OfferRow) => o.type === entities.type);
  }

  // Filter by location
  if (entities.location) {
    const loc = norm(entities.location);
    allOffers = allOffers.filter((o: OfferRow) => {
      const offerLoc = norm(o.location);
      const company = companyMap.get(o.companyId);
      const compLoc = norm(company?.location ?? '');
      return offerLoc.includes(loc) || compLoc.includes(loc);
    });
  }

  // Filter by skills (score-based)
  if (entities.skills.length > 0) {
    const scored = allOffers
      .map((o: OfferRow) => {
        const text = norm(o.title + ' ' + o.description + ' ' + o.requirements);
        const matchCount = entities.skills.filter(s => text.includes(s)).length;
        return { ...o, _score: matchCount };
      })
      .filter(o => o._score > 0)
      .sort((a, b) => b._score - a._score);
    allOffers = scored;
  }

  // Filter by company name
  if (entities.companyName) {
    const target = norm(entities.companyName);
    allOffers = allOffers.filter((o: OfferRow) => {
      const company = companyMap.get(o.companyId);
      return company && norm(company.companyName).includes(target);
    });
  }

  // Filter by duration
  if (entities.duration) {
    const durNorm = norm(entities.duration);
    allOffers = allOffers.filter((o: OfferRow) => norm(o.duration).includes(durNorm));
  }

  // Format response
  if (allOffers.length === 0) {
    const filters: string[] = [];
    if (entities.skills.length > 0) filters.push(`skills: ${entities.skills.join(', ')}`);
    if (entities.location) filters.push(`location: ${entities.location}`);
    if (entities.type) filters.push(`type: ${entities.type}`);
    return {
      reply: `I couldn't find any internships matching your criteria${filters.length > 0 ? ` (${filters.join(', ')})` : ''}. Try broadening your search or check back later for new offers!`,
      suggestions: ['Show all internships', 'Remote internships', 'Recommend offers for me'],
    };
  }

  const top = allOffers.slice(0, 5);
  const offerList = top.map((o: OfferRow, i: number) => {
    const company = companyMap.get(o.companyId);
    return `${i + 1}. **${o.title}** at ${company?.companyName ?? 'Unknown'} — ${o.location} (${o.type}) — ${o.duration}`;
  }).join('\n');

  const total = allOffers.length;
  const moreText = total > 5 ? `\n\n...and ${total - 5} more. Visit the Internships page to see all results.` : '';

  return {
    reply: `I found **${total}** internship${total > 1 ? 's' : ''} for you:\n\n${offerList}${moreText}`,
    suggestions: ['Tell me more about #1', 'Recommend offers for me', 'How do I apply?'],
    data: top.map((o: OfferRow) => ({ id: o.id, title: o.title, company: companyMap.get(o.companyId)?.companyName })),
  };
}

async function handleRecommendOffers(userId: string): Promise<ChatResponse> {
  try {
    const matches = await getSmartMatches(userId, 5);
    if (matches.length === 0) {
      return {
        reply: "There are no active internship offers to recommend right now. Check back later!",
        suggestions: ['Show my profile', 'How do I apply?'],
      };
    }

    const offerList = matches.map((m, i) =>
      `${i + 1}. **${m.title}** at ${m.companyName} — **${m.matchScore}%** match\n   Skills matched: ${m.matchedSkills.length > 0 ? m.matchedSkills.join(', ') : 'none'} | ${m.location} (${m.type})`
    ).join('\n\n');

    return {
      reply: `Here are your top SmartMatch® recommendations:\n\n${offerList}\n\nThese are ranked by how well they match your profile (skills, department, location).`,
      suggestions: ['How do I apply?', 'Show my applications', 'Search for more offers'],
      data: matches.map(m => ({ id: m.id, title: m.title, matchScore: m.matchScore })),
    };
  } catch (err: unknown) {
    const e = err as { code?: string; message: string };
    if (e.code === 'NOT_FOUND') {
      return {
        reply: "It looks like you don't have a student profile set up yet. Please complete your profile first so I can give you personalized recommendations!",
        suggestions: ['Show my profile', 'How do I apply?'],
      };
    }
    throw err;
  }
}

async function handleMyApplications(userId: string): Promise<ChatResponse> {
  // Get student
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  if (!student) {
    return {
      reply: "You don't have a student profile yet. Please complete your profile first!",
      suggestions: ['Show my profile', 'How do I apply?'],
    };
  }

  const apps = await db
    .select({
      id: applications.id,
      offerId: applications.offerId,
      status: applications.status,
      appliedAt: applications.appliedAt,
    })
    .from(applications)
    .where(eq(applications.studentId, student.id));

  if (apps.length === 0) {
    return {
      reply: "You haven't applied to any internships yet. Browse the offers and find one that matches your skills!",
      suggestions: ['Search internships', 'Recommend offers for me', 'How do I apply?'],
    };
  }

  // Get offer details
  const offerRows = await Promise.all(
    apps.map((a: { offerId: string }) => db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId)).then((r: { title?: string }[]) => r[0]))
  );

  const appList = apps.map((a: { status: string }, i: number) => {
    const offer = offerRows[i];
    return `- **${offer?.title ?? 'Unknown offer'}** — Status: **${a.status}**`;
  }).join('\n');

  const summary = {
    total: apps.length,
    pending: apps.filter((a: { status: string }) => a.status === 'pending').length,
    accepted: apps.filter((a: { status: string }) => a.status === 'accepted').length,
    rejected: apps.filter((a: { status: string }) => a.status === 'rejected').length,
  };

  return {
    reply: `You have **${summary.total}** application${summary.total > 1 ? 's' : ''}:\n\n${appList}\n\nSummary: ${summary.pending} pending, ${summary.accepted} accepted, ${summary.rejected} rejected`,
    suggestions: ['Search more internships', 'Recommend offers', 'Show my profile'],
    data: apps,
  };
}

async function handleMyProfile(userId: string): Promise<ChatResponse> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [student] = await db.select().from(students).where(eq(students.userId, userId));

  if (!user) {
    return { reply: "I couldn't find your user account. Please try logging in again." };
  }

  if (!student) {
    return {
      reply: "You don't have a student profile yet. Go to your profile page to set it up!",
      suggestions: ['How do I apply?'],
    };
  }

  // Calculate profile completeness
  const fields = [
    { name: 'First Name', value: user.firstName },
    { name: 'Last Name', value: user.lastName },
    { name: 'University', value: user.university },
    { name: 'Department', value: student.department },
    { name: 'Bio', value: student.bio },
    { name: 'CV', value: student.cvUrl },
    { name: 'Skills', value: student.skills.length > 0 ? 'yes' : null },
  ];

  const filled = fields.filter(f => f.value).length;
  const total = fields.length;
  const percent = Math.round((filled / total) * 100);
  const missing = fields.filter(f => !f.value).map(f => f.name);

  let reply = `**Your Profile** (${percent}% complete)\n\n`;
  reply += `• **Name**: ${user.firstName ?? '—'} ${user.lastName ?? '—'}\n`;
  reply += `• **University**: ${user.university ?? '—'}\n`;
  reply += `• **Department**: ${student.department ?? '—'}\n`;
  reply += `• **Skills**: ${student.skills.length > 0 ? student.skills.join(', ') : '—'}\n`;
  reply += `• **Bio**: ${student.bio ? 'Yes' : '—'}\n`;
  reply += `• **CV**: ${student.cvUrl ? 'Uploaded' : '—'}\n`;

  if (missing.length > 0) {
    reply += `\nMissing: ${missing.join(', ')}. Complete your profile for better SmartMatch® results!`;
  } else {
    reply += `\nYour profile is complete! You're getting the best SmartMatch® recommendations.`;
  }

  return {
    reply,
    suggestions: ['Recommend offers for me', 'Show my applications', 'Search internships'],
  };
}

async function handleCompanyInfo(entities: ExtractedEntities, message: string): Promise<ChatResponse> {
  // Try to find company name from entities or from the message
  let search = entities.companyName;
  if (!search) {
    // Try to extract from message directly
    const words = message.replace(/[?!.,]/g, '').split(' ');
    const stopwords = new Set(['tell', 'me', 'about', 'the', 'company', 'info', 'what', 'is', 'who', 'are', 'know', 'a', 'an']);
    search = words.filter(w => !stopwords.has(w.toLowerCase()) && w.length > 2).join(' ');
  }

  if (!search || search.trim().length < 2) {
    return {
      reply: "Which company would you like to know about? Please mention the company name.",
      suggestions: ['Show all companies'],
    };
  }

  const companyResults = await db
    .select()
    .from(companies)
    .where(and(eq(companies.isValidated, true), ilike(companies.companyName, `%${search}%`)));

  if (companyResults.length === 0) {
    return {
      reply: `I couldn't find a company matching "${search}". Make sure the company is registered and validated on Stag.io.`,
      suggestions: ['Show all companies', 'Search internships'],
    };
  }

  const c = companyResults[0];
  // Count active offers
  const offerRows = await db
    .select({ id: internshipOffers.id })
    .from(internshipOffers)
    .where(and(eq(internshipOffers.companyId, c.id), eq(internshipOffers.status, 'active')));

  let reply = `**${c.companyName}**\n\n`;
  reply += `• **Industry**: ${c.industry ?? '—'}\n`;
  reply += `• **Location**: ${c.location ?? '—'}\n`;
  reply += `• **Website**: ${c.website ?? '—'}\n`;
  reply += `• **Description**: ${c.description ?? '—'}\n`;
  reply += `• **Active offers**: ${offerRows.length}\n`;

  return {
    reply,
    suggestions: offerRows.length > 0
      ? [`Show ${c.companyName} internships`, 'Search internships']
      : ['Search internships', 'Recommend offers for me'],
    data: { id: c.id, name: c.companyName, offers: offerRows.length },
  };
}

function handleUnknown(message: string): ChatResponse {
  return {
    reply: `I'm not sure I understand "${message}". I can help you with internship searches, personalized recommendations, application tracking, and more.`,
    suggestions: [
      'Search internships',
      'Recommend offers for me',
      'Show my applications',
      'Help',
    ],
  };
}

/* ══════════════════════════════════════════
   4. MAIN CHAT HANDLER
   ══════════════════════════════════════════ */

export async function processChat(
  message: string,
  userId: string | null,
  _history: ChatMessage[] = [],
): Promise<ChatResponse> {
  const intent = detectIntent(message);
  const entities = extractEntities(message);

  // Auth-required intents
  const authRequired: Intent[] = ['recommend_offers', 'my_applications', 'my_profile'];
  if (authRequired.includes(intent) && !userId) {
    return {
      reply: "You need to be logged in to use this feature. Please log in first!",
      suggestions: ['How do I apply?', 'Search internships'],
    };
  }

  switch (intent) {
    case 'greeting':
      return handleGreeting(userId);

    case 'thanks':
      return handleThanks();

    case 'help':
      return handleHelp();

    case 'how_to_apply':
      return handleHowToApply();

    case 'search_offers':
      return handleSearchOffers(entities);

    case 'recommend_offers':
      return handleRecommendOffers(userId!);

    case 'my_applications':
      return handleMyApplications(userId!);

    case 'my_profile':
      return handleMyProfile(userId!);

    case 'company_info':
      return handleCompanyInfo(entities, message);

    case 'unknown':
    default:
      return handleUnknown(message);
  }
}
