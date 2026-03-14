import { GoogleGenerativeAI } from '@google/generative-ai';
import { eq } from 'drizzle-orm';
import { db } from '../model/db';
import { students, users, internshipOffers, companies, applications } from '../model/schema';
import { getSmartMatches } from './matching.service';

/* ══════════════════════════════════════════════════════════════
   Stag.io AI Chatbot — Powered by Gemini
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

/* ── Lazy Gemini client (initialized on first use so dotenv is loaded) ── */
let _model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
function getModel() {
  if (!_model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    _model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  }
  return _model;
}

/* ── System prompt ── */
const SYSTEM_PROMPT = `You are **Stag**, the AI assistant for Stag.io — an internship platform for Algerian students.

Your capabilities:
- Help students find and search internships
- Give personalized recommendations (SmartMatch®)
- Track application status
- Explain how the platform works
- Answer questions about companies on the platform

Rules:
- Be concise and helpful. Keep responses short (2-4 sentences max for simple questions).
- Use **bold** for emphasis (markdown).
- You're friendly but professional.
- Only answer questions related to internships, careers, and the Stag.io platform.
- If asked about unrelated topics, politely redirect to internship-related help.
- Never make up internship offers or data — only reference real data provided in context.
- Respond in the same language the user writes in (English, French, or Arabic).`;

/* ── Build context from DB for the user ── */
async function buildUserContext(userId: string | null): Promise<string> {
  try {
    const parts: string[] = [];

    if (userId) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user) {
        parts.push(`User: ${user.firstName ?? ''} ${user.lastName ?? ''} (${user.university ?? 'no university'})`);
      }

      const [student] = await db.select().from(students).where(eq(students.userId, userId));
      if (student) {
        parts.push(`Skills: ${student.skills.length > 0 ? student.skills.join(', ') : 'none'}`);
        parts.push(`Department: ${student.department ?? 'not set'}`);
        parts.push(`Profile complete: ${student.bio && student.cvUrl ? 'yes' : 'no'}`);
      }
    }

    const activeOffers = await db
      .select({ id: internshipOffers.id })
      .from(internshipOffers)
      .where(eq(internshipOffers.status, 'active'));
    parts.push(`Active internships on platform: ${activeOffers.length}`);

    return parts.length > 0 ? `\n\nContext:\n${parts.join('\n')}` : '';
  } catch {
    return '';
  }
}

/* ── Detect if user asks for specific data ── */
function needsData(message: string): 'offers' | 'applications' | 'profile' | 'recommend' | null {
  const lower = message.toLowerCase();
  if (/\b(recommend|suggestion|best for me|smartmatch|what should i apply)\b/i.test(lower)) return 'recommend';
  if (/\b(my|mes)\b.*\b(application|candidature|applied|postul)/i.test(lower)) return 'applications';
  if (/\b(my|mon|ma)\b.*\b(profile|profil|skills|info)\b/i.test(lower)) return 'profile';
  if (/\b(search|find|show|list|browse|available|internship|offer|stage|remote|onsite|hybrid)\b/i.test(lower)) return 'offers';
  return null;
}

/* ── Fetch real data to inject into prompt ── */
async function fetchDataContext(type: string, userId: string | null): Promise<string> {
  try {
    if (type === 'recommend' && userId) {
      const matches = await getSmartMatches(userId, 5);
      if (matches.length === 0) return '\nNo recommendations available — either no offers or no student profile.';
      const list = matches.map((m, i) =>
        `${i + 1}. "${m.title}" at ${m.companyName} — ${m.matchScore}% match (skills: ${m.matchedSkills.join(', ') || 'none'}) — ${m.location} (${m.type})`
      ).join('\n');
      return `\nSmartMatch® recommendations:\n${list}`;
    }

    if (type === 'applications' && userId) {
      const [student] = await db.select().from(students).where(eq(students.userId, userId));
      if (!student) return '\nUser has no student profile yet.';
      const apps = await db.select().from(applications).where(eq(applications.studentId, student.id));
      if (apps.length === 0) return '\nUser has no applications yet.';
      const offerRows = await Promise.all(
        apps.map(a => db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId)).then(r => r[0]))
      );
      const list = apps.map((a, i) => `- "${offerRows[i]?.title ?? 'Unknown'}" — status: ${a.status}`).join('\n');
      return `\nUser's applications:\n${list}\nTotal: ${apps.length} (${apps.filter(a => a.status === 'pending').length} pending, ${apps.filter(a => a.status === 'accepted').length} accepted, ${apps.filter(a => a.status === 'rejected').length} rejected)`;
    }

    if (type === 'profile' && userId) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [student] = await db.select().from(students).where(eq(students.userId, userId));
      if (!user) return '\nUser account not found.';
      if (!student) return '\nNo student profile set up yet.';
      const fields = [
        `Name: ${user.firstName ?? '—'} ${user.lastName ?? '—'}`,
        `University: ${user.university ?? '—'}`,
        `Department: ${student.department ?? '—'}`,
        `Skills: ${student.skills.length > 0 ? student.skills.join(', ') : '—'}`,
        `Bio: ${student.bio ? 'yes' : 'missing'}`,
        `CV: ${student.cvUrl ? 'uploaded' : 'missing'}`,
      ];
      const filled = [user.firstName, user.lastName, user.university, student.department, student.bio, student.cvUrl, student.skills.length > 0].filter(Boolean).length;
      return `\nUser profile (${Math.round((filled / 7) * 100)}% complete):\n${fields.join('\n')}`;
    }

    if (type === 'offers') {
      const offers = await db
        .select({
          id: internshipOffers.id,
          title: internshipOffers.title,
          location: internshipOffers.location,
          type: internshipOffers.type,
          duration: internshipOffers.duration,
          companyId: internshipOffers.companyId,
        })
        .from(internshipOffers)
        .where(eq(internshipOffers.status, 'active'));

      if (offers.length === 0) return '\nNo active internship offers currently.';

      const companyIds = [...new Set(offers.map(o => o.companyId))];
      const companyRows = await Promise.all(
        companyIds.map(id => db.select().from(companies).where(eq(companies.id, id)).then(r => r[0]))
      );
      const companyMap = new Map(companyRows.filter(Boolean).map(c => [c!.id, c!.companyName]));

      const list = offers.slice(0, 10).map((o, i) =>
        `${i + 1}. "${o.title}" at ${companyMap.get(o.companyId) ?? 'Unknown'} — ${o.location} (${o.type}) — ${o.duration}`
      ).join('\n');

      const more = offers.length > 10 ? `\n...and ${offers.length - 10} more offers.` : '';
      return `\nActive internships (${offers.length} total):\n${list}${more}`;
    }
  } catch {
    return '\nCould not fetch data at this time.';
  }

  return '';
}

/* ── Suggestion generator ── */
function getSuggestions(message: string, userId: string | null): string[] {
  const lower = message.toLowerCase();
  if (/\b(hi|hello|hey|bonjour|salut)\b/i.test(lower)) {
    return ['Search internships', 'Recommend offers for me', 'How do I apply?', 'Help'];
  }
  if (/\b(thank|merci)\b/i.test(lower)) {
    return ['Search internships', 'My applications', 'Recommend offers'];
  }
  if (userId) {
    return ['Search internships', 'Recommend offers for me', 'My applications', 'My profile'];
  }
  return ['Search internships', 'How do I apply?', 'Help'];
}

/* ══════════════════════════════════════════
   MAIN CHAT HANDLER
   ══════════════════════════════════════════ */

export async function processChat(
  message: string,
  userId: string | null,
  history: ChatMessage[] = [],
): Promise<ChatResponse> {
  // Check if the intent needs auth
  const dataType = needsData(message);
  if (['recommend', 'applications', 'profile'].includes(dataType ?? '') && !userId) {
    return {
      reply: "You need to be logged in to use this feature. Please log in first!",
      suggestions: ['How do I apply?', 'Search internships'],
    };
  }

  // Build context (won't throw)
  const userContext = await buildUserContext(userId);
  const dataContext = dataType ? await fetchDataContext(dataType, userId) : '';

  // Build conversation history for Gemini (last 6 messages to save tokens)
  const recentHistory = history.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.text }],
  }));

  // Call Gemini
  try {
    const chat = getModel().startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT + userContext + dataContext }] },
        { role: 'model', parts: [{ text: 'Understood! I\'m Stag, ready to help with internships on Stag.io.' }] },
        ...recentHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text().trim();

    return {
      reply,
      suggestions: getSuggestions(message, userId),
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[Chatbot Gemini Error]', e.message);
    // Handle rate limiting gracefully
    if (e.message?.includes('429') || e.message?.includes('quota')) {
      return {
        reply: "I'm getting a lot of messages right now and need a short break. Please try again in a minute!",
        suggestions: ['Search internships', 'Help'],
      };
    }
    return {
      reply: "Sorry, I couldn't process your message right now. Please try again!",
      suggestions: ['Search internships', 'Help'],
    };
  }
}
