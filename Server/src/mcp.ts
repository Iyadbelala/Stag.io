import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ── Service imports ──────────────────────────────────────────────
import { listPublicOffers, createOffer, getCompanyOffers, deleteOffer } from './context/offers.service';
import { listPublicCompanies } from './context/companies.service';
import { getCompanyDashboard } from './context/company-dashboard.service';
import { getCompanyProfile, updateCompanyProfile } from './context/company-profile.service';
import { getStudentProfile, updateStudentProfile } from './context/profile.service';
import { getStudentDashboard } from './context/student-dashboard.service';

// ── Server setup ─────────────────────────────────────────────────
const server = new McpServer({
  name: 'stagio',
  version: '0.1.0',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PUBLIC TOOLS (no userId required)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'list_internships',
  'List all active internship offers on the platform',
  {},
  async () => {
    try {
      const offers = await listPublicOffers();
      return { content: [{ type: 'text' as const, text: JSON.stringify(offers, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'list_companies',
  'List all registered companies with their open position counts',
  {},
  async () => {
    try {
      const companies = await listPublicCompanies();
      return { content: [{ type: 'text' as const, text: JSON.stringify(companies, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COMPANY TOOLS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'get_company_dashboard',
  'Get dashboard statistics for a company (active listings, applications, etc.)',
  { userId: z.string().describe('The company user ID') },
  async ({ userId }) => {
    try {
      const dashboard = await getCompanyDashboard(userId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(dashboard, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'get_company_profile',
  'Get a company\'s profile information',
  { userId: z.string().describe('The company user ID') },
  async ({ userId }) => {
    try {
      const profile = await getCompanyProfile(userId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(profile, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'update_company_profile',
  'Update a company\'s profile (name, industry, website, description, location, contact person)',
  {
    userId: z.string().describe('The company user ID'),
    companyName: z.string().optional().describe('New company name'),
    industry: z.string().optional().describe('Industry sector'),
    website: z.string().optional().describe('Company website URL'),
    description: z.string().optional().describe('Company description'),
    location: z.string().optional().describe('Company location'),
    contactPerson: z.string().optional().describe('Contact person name'),
  },
  async ({ userId, ...fields }) => {
    try {
      const profile = await updateCompanyProfile(userId, fields);
      return { content: [{ type: 'text' as const, text: JSON.stringify(profile, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'get_company_offers',
  'List all internship offers belonging to a company',
  { userId: z.string().describe('The company user ID') },
  async ({ userId }) => {
    try {
      const offers = await getCompanyOffers(userId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(offers, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'create_offer',
  'Create a new internship offer for a company',
  {
    userId: z.string().describe('The company user ID'),
    title: z.string().describe('Position title (e.g. "Frontend Developer Intern")'),
    description: z.string().describe('Role description and responsibilities'),
    requirements: z.string().describe('Skills and qualifications needed'),
    duration: z.string().describe('Internship duration (e.g. "3 months")'),
    location: z.string().describe('Office location (e.g. "Constantine, Algeria")'),
    type: z.enum(['remote', 'onsite', 'hybrid']).describe('Work arrangement type'),
  },
  async ({ userId, title, description, requirements, duration, location, type }) => {
    try {
      const offer = await createOffer(userId, { title, description, requirements, duration, location, type });
      return { content: [{ type: 'text' as const, text: JSON.stringify(offer, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'delete_offer',
  'Delete an internship offer',
  {
    userId: z.string().describe('The company user ID'),
    offerId: z.string().describe('The offer ID to delete'),
  },
  async ({ userId, offerId }) => {
    try {
      await deleteOffer(userId, offerId);
      return { content: [{ type: 'text' as const, text: 'Offer deleted successfully.' }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STUDENT TOOLS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.tool(
  'get_student_dashboard',
  'Get dashboard statistics for a student (applications sent, accepted, pending, etc.)',
  { userId: z.string().describe('The student user ID') },
  async ({ userId }) => {
    try {
      const dashboard = await getStudentDashboard(userId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(dashboard, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'get_student_profile',
  'Get a student\'s profile information',
  { userId: z.string().describe('The student user ID') },
  async ({ userId }) => {
    try {
      const profile = await getStudentProfile(userId);
      return { content: [{ type: 'text' as const, text: JSON.stringify(profile, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

server.tool(
  'update_student_profile',
  'Update a student\'s profile (name, department, bio, skills)',
  {
    userId: z.string().describe('The student user ID'),
    firstName: z.string().optional().describe('First name'),
    lastName: z.string().optional().describe('Last name'),
    department: z.string().optional().describe('Academic department'),
    bio: z.string().optional().describe('Short biography'),
    skills: z.array(z.string()).optional().describe('List of skills'),
  },
  async ({ userId, ...fields }) => {
    try {
      const profile = await updateStudentProfile(userId, fields);
      return { content: [{ type: 'text' as const, text: JSON.stringify(profile, null, 2) }] };
    } catch (err: unknown) {
      return errorResult(err);
    }
  },
);

// ── Helpers ──────────────────────────────────────────────────────
function errorResult(err: unknown) {
  const e = err as { message?: string };
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: `Error: ${e.message ?? 'Unknown error'}` }],
  };
}

// ── Start ────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('☕ Stag.io MCP server running on stdio');
}

main().catch((err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});
