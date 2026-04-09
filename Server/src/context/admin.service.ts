import { eq, desc, ilike, or, and, count } from 'drizzle-orm';
import { db } from '../model/db';
import { users, companies, students, internshipOffers, applications, universities } from '../model/schema';
import PDFDocument from 'pdfkit';
import { sendNotification } from './notifications.service';

/* ──────────────────────────────────────────────
   Helper
   ────────────────────────────────────────────── */
function serviceError(message: string, code: string, status: number): never {
  const err = new Error(message) as Error & { code: string; status: number };
  err.code = code;
  err.status = status;
  throw err;
}

/* ──────────────────────────────────────────────
   Company validation types & functions
   ────────────────────────────────────────────── */
export interface PendingCompany {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  contactPerson: string | null;
  email: string;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  verificationDocumentUrl: string | null;
  createdAt: string;
}

export async function getPendingCompanies(): Promise<PendingCompany[]> {
  const rows = await db
    .select()
    .from(companies)
    .where(eq(companies.isValidated, false))
    .orderBy(desc(companies.createdAt));

  const result: PendingCompany[] = [];
  for (const c of rows) {
    const [user] = await db.select().from(users).where(eq(users.id, c.userId));
    result.push({
      id: c.id,
      companyName: c.companyName,
      industry: c.industry,
      location: c.location,
      contactPerson: c.contactPerson,
      email: user?.email ?? '',
      website: c.website,
      description: c.description,
      logoUrl: c.logoUrl,
      verificationDocumentUrl: c.verificationDocumentUrl,
      createdAt: c.createdAt.toISOString(),
    });
  }

  return result;
}

export async function validateCompany(companyId: string): Promise<{ id: string; isValidated: boolean }> {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (company.isValidated) {
    const err = new Error('Company is already validated') as Error & { code: string; status: number };
    err.code = 'ALREADY_VALIDATED';
    err.status = 400;
    throw err;
  }

  const [updated] = await db
    .update(companies)
    .set({ isValidated: true })
    .where(eq(companies.id, companyId))
    .returning();

  return { id: updated.id, isValidated: updated.isValidated };
}

export async function rejectCompany(companyId: string): Promise<void> {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));

  if (!company) {
    const err = new Error('Company not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Soft-delete: deactivate the user account (preserves record for audit)
  await db.update(users).set({ deactivatedAt: new Date() }).where(eq(users.id, company.userId));
}

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export interface AdminApplication {
  id: string;
  studentName: string;
  studentEmail: string;
  offerTitle: string;
  companyName: string;
  coverLetter: string | null;
  cvUrl: string | null;
  status: string;
  appliedAt: string;
}

/* ──────────────────────────────────────────────
   List accepted applications (pending admin validation)
   ────────────────────────────────────────────── */
export async function getAcceptedApplications(): Promise<AdminApplication[]> {
  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.status, 'accepted'))
    .orderBy(desc(applications.updatedAt));

  return buildAdminApplications(apps);
}

/* ──────────────────────────────────────────────
   List all applications (with search/filter/pagination)
   ────────────────────────────────────────────── */
export interface ApplicationListResult {
  applications: AdminApplication[];
  total: number;
  page: number;
  limit: number;
}

export async function getAllApplications(opts?: {
  q?: string;
  status?: string;
  company?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<ApplicationListResult> {
  const page = Math.max(opts?.page ?? 1, 1);
  const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);

  const allApps = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.updatedAt));

  const enriched = await buildAdminApplications(allApps);

  // Apply filters on enriched data (we need student/company names)
  let filtered = enriched;

  if (opts?.status) {
    filtered = filtered.filter((a) => a.status === opts.status);
  }

  if (opts?.q) {
    const q = opts.q.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.studentEmail.toLowerCase().includes(q) ||
        a.offerTitle.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q),
    );
  }

  if (opts?.company) {
    const c = opts.company.toLowerCase();
    filtered = filtered.filter((a) => a.companyName.toLowerCase().includes(c));
  }

  if (opts?.from) {
    const fromDate = new Date(opts.from);
    filtered = filtered.filter((a) => new Date(a.appliedAt) >= fromDate);
  }

  if (opts?.to) {
    const toDate = new Date(opts.to);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter((a) => new Date(a.appliedAt) <= toDate);
  }

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return { applications: paginated, total, page, limit };
}

async function buildAdminApplications(apps: (typeof applications.$inferSelect)[]): Promise<AdminApplication[]> {
  const result: AdminApplication[] = [];
  for (const a of apps) {
    const [student] = await db.select().from(students).where(eq(students.id, a.studentId));
    const [studentUser] = student
      ? await db.select().from(users).where(eq(users.id, student.userId))
      : [undefined];
    const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, a.offerId));
    const [company] = offer
      ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
      : [undefined];

    result.push({
      id: a.id,
      studentName: `${studentUser?.firstName ?? ''} ${studentUser?.lastName ?? ''}`.trim() || 'Unknown',
      studentEmail: studentUser?.email ?? '',
      offerTitle: offer?.title ?? '',
      companyName: company?.companyName ?? '',
      coverLetter: a.coverLetter,
      cvUrl: a.cvUrl,
      status: a.status,
      appliedAt: a.appliedAt.toISOString(),
    });
  }
  return result;
}

/* ──────────────────────────────────────────────
   Validate an accepted application
   ────────────────────────────────────────────── */
export async function validateApplication(applicationId: string): Promise<{ id: string; status: string }> {
  const [app] = await db.select().from(applications).where(eq(applications.id, applicationId));

  if (!app) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (app.status !== 'accepted') {
    const err = new Error('Only accepted applications can be validated') as Error & { code: string; status: number };
    err.code = 'INVALID_STATUS';
    err.status = 400;
    throw err;
  }

  const [updated] = await db
    .update(applications)
    .set({ status: 'validated' })
    .where(eq(applications.id, applicationId))
    .returning();

  // Notify the student that their application was validated
  const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
  if (student) {
    const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
    sendNotification(
      student.userId,
      'application_status_changed',
      'Application Validated',
      `Your application for "${offer?.title ?? 'an internship'}" has been validated by the admin`,
      applicationId,
    ).catch(() => {});
  }

  return { id: updated.id, status: updated.status };
}

/* ──────────────────────────────────────────────
   Batch-validate multiple accepted applications
   ────────────────────────────────────────────── */
export async function batchValidateApplications(ids: string[]): Promise<{ validated: string[]; skipped: string[] }> {
  if (!ids.length) serviceError('No application IDs provided', 'BAD_REQUEST', 400);

  const validated: string[] = [];
  const skipped: string[] = [];

  for (const id of ids) {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    if (!app || app.status !== 'accepted') {
      skipped.push(id);
      continue;
    }

    await db.update(applications).set({ status: 'validated' }).where(eq(applications.id, id));
    validated.push(id);

    // Notify student
    const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
    if (student) {
      const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
      sendNotification(
        student.userId,
        'application_status_changed',
        'Application Validated',
        `Your application for "${offer?.title ?? 'an internship'}" has been validated by the admin`,
        id,
      ).catch(() => {});
    }
  }

  return { validated, skipped };
}

/* ──────────────────────────────────────────────
   Export applications as CSV
   ────────────────────────────────────────────── */
export async function exportApplicationsCsv(opts?: {
  status?: string;
  company?: string;
  from?: string;
  to?: string;
}): Promise<string> {
  const { applications: apps } = await getAllApplications({ ...opts, limit: 100, page: 1 });

  // Also fetch all if > 100
  const allResult = await getAllApplications({ ...opts, limit: 10000, page: 1 });
  const rows = allResult.applications;

  const header = ['ID', 'Student Name', 'Student Email', 'Offer Title', 'Company', 'Status', 'Applied At'];
  const csvLines = [header.join(',')];

  for (const a of rows) {
    csvLines.push(
      [
        a.id,
        `"${a.studentName.replace(/"/g, '""')}"`,
        a.studentEmail,
        `"${a.offerTitle.replace(/"/g, '""')}"`,
        `"${a.companyName.replace(/"/g, '""')}"`,
        a.status,
        a.appliedAt,
      ].join(','),
    );
  }

  return csvLines.join('\n');
}

/* ──────────────────────────────────────────────
   Generate internship agreement PDF
   ────────────────────────────────────────────── */
export async function generateApplicationPdf(applicationId: string): Promise<Buffer> {
  const [app] = await db.select().from(applications).where(eq(applications.id, applicationId));

  if (!app) {
    const err = new Error('Application not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (app.status !== 'validated') {
    const err = new Error('PDF can only be generated for validated applications') as Error & { code: string; status: number };
    err.code = 'INVALID_STATUS';
    err.status = 400;
    throw err;
  }

  const [student] = await db.select().from(students).where(eq(students.id, app.studentId));
  const [studentUser] = student
    ? await db.select().from(users).where(eq(users.id, student.userId))
    : [undefined];
  const [offer] = await db.select().from(internshipOffers).where(eq(internshipOffers.id, app.offerId));
  const [company] = offer
    ? await db.select().from(companies).where(eq(companies.id, offer.companyId))
    : [undefined];

  // Build the PDF in memory
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const studentName = `${studentUser?.firstName ?? ''} ${studentUser?.lastName ?? ''}`.trim() || 'N/A';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageW = 595.28;
    const pageH = 841.89;
    const margin = 55;
    const contentW = pageW - margin * 2;

    // ── Colors ──
    const gold = '#C8A97E';
    const darkBrown = '#3E2723';
    const warmBrown = '#5D4037';
    const cream = '#FDF8F0';
    const lightGold = '#F5ECD7';
    const midGray = '#888888';

    // ═══════════════════════════════════════════
    //  TOP BANNER — dark brown with gold accents
    // ═══════════════════════════════════════════
    doc.rect(0, 0, pageW, 130).fill(darkBrown);

    // Gold accent strip at the very top
    doc.rect(0, 0, pageW, 5).fill(gold);

    // Decorative corner diamonds ◆
    const drawDiamond = (cx: number, cy: number, r: number, color: string) => {
      doc.save();
      doc.path(`M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`).fill(color);
      doc.restore();
    };
    drawDiamond(margin - 8, 65, 6, gold);
    drawDiamond(pageW - margin + 8, 65, 6, gold);

    // Brand name
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#FFFFFF');
    doc.text('Universit\u00E9 Constantine 2', margin, 25, { width: contentW, align: 'center' });

    // Sub-brand
    doc.font('Helvetica').fontSize(10).fillColor(gold);
    doc.text('Stag.io  \u2014  INTERNSHIP MANAGEMENT PLATFORM', margin, 55, { width: contentW, align: 'center', characterSpacing: 1.5 });

    // Title
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF');
    doc.text('INTERNSHIP AGREEMENT', margin, 88, { width: contentW, align: 'center', characterSpacing: 1.5 });

    // Gold line under banner
    doc.rect(0, 125, pageW, 5).fill(gold);

    // ═══════════════════════════════════════════
    //  REFERENCE BAR — light cream
    // ═══════════════════════════════════════════
    doc.rect(0, 130, pageW, 36).fill(lightGold);
    doc.font('Helvetica').fontSize(8.5).fillColor(warmBrown);
    doc.text(`Date: ${today}`, margin, 142);
    doc.text(`Ref: ${app.id}`, margin, 142, { width: contentW, align: 'right' });

    let y = 185;

    // ═══════════════════════════════════════════
    //  HELPER — section header with gold left bar
    // ═══════════════════════════════════════════
    const sectionHeader = (num: string, title: string) => {
      // Gold left bar
      doc.rect(margin, y, 4, 20).fill(gold);
      // Number circle
      doc.circle(margin + 20, y + 10, 11).fill(darkBrown);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      doc.text(num, margin + 14, y + 5, { width: 12, align: 'center' });
      // Title
      doc.font('Helvetica-Bold').fontSize(13).fillColor(darkBrown);
      doc.text(title, margin + 38, y + 3);
      y += 30;
    };

    // ═══════════════════════════════════════════
    //  HELPER — info card (rounded rect background)
    // ═══════════════════════════════════════════
    const infoCard = (lines: { label: string; value: string }[], cardX: number, cardW: number) => {
      const labelColW = 75;
      const valueColW = cardW - 24 - labelColW;
      const cardH = lines.length * 18 + 16;
      doc.roundedRect(cardX, y, cardW, cardH, 6).fill(cream);
      doc.strokeColor(gold).lineWidth(0.5).roundedRect(cardX, y, cardW, cardH, 6).stroke();
      let ly = y + 10;
      for (const line of lines) {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
        doc.text(line.label, cardX + 12, ly, { width: labelColW });
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text(line.value, cardX + 12 + labelColW, ly, { width: valueColW, ellipsis: true });
        ly += 18;
      }
      return cardH;
    };

    // ═══════════════════════════════════════════
    //  1. PARTIES
    // ═══════════════════════════════════════════
    sectionHeader('1', 'Parties');

    doc.font('Helvetica').fontSize(9.5).fillColor('#555');
    doc.text('This agreement is entered into between the following parties:', margin + 6, y, { width: contentW });
    y += 22;

    // Two side-by-side cards
    const halfW = (contentW - 14) / 2;

    const studentLines = [
      { label: 'Full Name:', value: studentName },
      { label: 'Email:', value: studentUser?.email ?? 'N/A' },
      { label: 'University:', value: studentUser?.university ?? 'N/A' },
    ];
    const companyLines = [
      { label: 'Company:', value: company?.companyName ?? 'N/A' },
      { label: 'Location:', value: company?.location ?? 'N/A' },
      { label: 'Contact:', value: company?.contactPerson ?? 'N/A' },
    ];

    // Card labels
    doc.font('Helvetica-Bold').fontSize(9).fillColor(gold);
    doc.text('THE STUDENT', margin + 6, y);
    doc.text('THE COMPANY', margin + halfW + 20, y);
    y += 14;

    const h1 = infoCard(studentLines, margin, halfW);
    const saveY = y;
    infoCard(companyLines, margin + halfW + 14, halfW);
    y = saveY + h1 + 18;

    // ═══════════════════════════════════════════
    //  2. INTERNSHIP DETAILS
    // ═══════════════════════════════════════════
    sectionHeader('2', 'Internship Details');

    const detailLines = [
      { label: 'Position:', value: offer?.title ?? 'N/A' },
      { label: 'Duration:', value: offer?.duration ?? 'N/A' },
      { label: 'Location:', value: offer?.location ?? 'N/A' },
      { label: 'Type:', value: offer ? offer.type.charAt(0).toUpperCase() + offer.type.slice(1) : 'N/A' },
    ];
    const dh = infoCard(detailLines, margin, contentW);
    y += dh + 12;

    // Description & Requirements in a light box
    doc.roundedRect(margin, y, contentW, 0.1, 4); // just to position
    const descBoxY = y;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
    doc.text('DESCRIPTION', margin + 10, y + 6);
    doc.font('Helvetica').fontSize(9).fillColor('#444');
    doc.text(offer?.description ?? '', margin + 10, y + 18, { width: contentW - 20 });
    y = doc.y + 10;

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
    doc.text('REQUIREMENTS', margin + 10, y);
    doc.font('Helvetica').fontSize(9).fillColor('#444');
    doc.text(offer?.requirements ?? '', margin + 10, y + 12, { width: contentW - 20 });
    y = doc.y + 10;

    // Draw the outer box around desc+req
    const descBoxH = y - descBoxY;
    doc.roundedRect(margin, descBoxY, contentW, descBoxH, 4).strokeColor(lightGold).lineWidth(1).stroke();
    y += 12;

    // ═══════════════════════════════════════════
    //  3. TERMS & CONDITIONS
    // ═══════════════════════════════════════════
    sectionHeader('3', 'Terms and Conditions');

    const terms = [
      'The intern will perform duties as outlined in the internship description above.',
      'The company will provide adequate supervision and mentorship throughout the internship.',
      'This agreement may be terminated by either party with two (2) weeks written notice.',
      'The intern agrees to abide by the company\'s confidentiality and workplace policies.',
      'Both parties agree to uphold professional standards and mutual respect at all times.',
    ];

    for (const term of terms) {
      // Gold bullet
      doc.circle(margin + 10, y + 5, 2.5).fill(gold);
      doc.font('Helvetica').fontSize(9).fillColor('#444');
      doc.text(term, margin + 20, y, { width: contentW - 26 });
      y = doc.y + 6;
    }
    y += 10;

    // ═══════════════════════════════════════════
    //  4. SIGNATURES
    // ═══════════════════════════════════════════
    sectionHeader('4', 'Signatures');

    // Thin separator
    doc.strokeColor(lightGold).lineWidth(0.5).moveTo(margin, y).lineTo(margin + contentW, y).stroke();
    y += 16;

    const sigColW = (contentW - 20) / 3;

    // Three signature blocks
    const sigBlocks = [
      { role: 'Student', name: studentName },
      { role: 'Company', name: company?.companyName ?? 'N/A' },
      { role: 'University Admin', name: 'Universit\u00E9 Constantine 2' },
    ];

    for (let i = 0; i < 3; i++) {
      const sx = margin + i * (sigColW + 10);

      // Signature line
      doc.strokeColor(warmBrown).lineWidth(0.8);
      doc.moveTo(sx, y + 28).lineTo(sx + sigColW - 5, y + 28).stroke();

      // Role label
      doc.font('Helvetica-Bold').fontSize(8).fillColor(gold);
      doc.text(sigBlocks[i].role.toUpperCase(), sx, y);

      // Name under line
      doc.font('Helvetica').fontSize(8.5).fillColor('#555');
      doc.text(sigBlocks[i].name, sx, y + 32, { width: sigColW - 5 });

      // Date placeholder
      doc.font('Helvetica').fontSize(7.5).fillColor(midGray);
      doc.text('Date: _______________', sx, y + 46, { width: sigColW - 5 });
    }

    // ═══════════════════════════════════════════
    //  BOTTOM BANNER — mirror of top
    // ═══════════════════════════════════════════
    const footerH = 40;
    const footerY = pageH - footerH;

    doc.rect(0, footerY, pageW, footerH).fill(darkBrown);
    doc.rect(0, footerY, pageW, 3).fill(gold);

    // Footer text
    doc.font('Helvetica').fontSize(7.5).fillColor(gold);
    doc.text('Universit\u00E9 Constantine 2  \u2022  Stag.io Internship Management Platform', 0, footerY + 15, { width: pageW, align: 'center' });

    // Decorative corner diamonds on footer
    drawDiamond(margin - 8, footerY + 20, 4, gold);
    drawDiamond(pageW - margin + 8, footerY + 20, 4, gold);

    // Vertical gold side accents (left & right page edges)
    doc.rect(0, 130, 3, footerY - 130).fill(lightGold);
    doc.rect(pageW - 3, 130, 3, footerY - 130).fill(lightGold);

    doc.end();
  });
}

/* ──────────────────────────────────────────────
   University validation types & functions
   ────────────────────────────────────────────── */
export interface PendingUniversity {
  id: string;
  universityName: string;
  domain: string;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  email: string;
  createdAt: string;
}

export async function getPendingUniversities(): Promise<PendingUniversity[]> {
  const rows = await db
    .select()
    .from(universities)
    .where(eq(universities.isValidated, false))
    .orderBy(desc(universities.createdAt));

  const result: PendingUniversity[] = [];
  for (const u of rows) {
    const [user] = await db.select().from(users).where(eq(users.id, u.userId));
    result.push({
      id: u.id,
      universityName: u.universityName,
      domain: u.domain,
      website: u.website,
      location: u.location,
      logoUrl: u.logoUrl,
      description: u.description,
      email: user?.email ?? '',
      createdAt: u.createdAt.toISOString(),
    });
  }

  return result;
}

export async function validateUniversity(universityId: string): Promise<{ id: string; isValidated: boolean }> {
  const [uni] = await db.select().from(universities).where(eq(universities.id, universityId));

  if (!uni) {
    const err = new Error('University not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (uni.isValidated) {
    const err = new Error('University is already validated') as Error & { code: string; status: number };
    err.code = 'ALREADY_VALIDATED';
    err.status = 400;
    throw err;
  }

  const [updated] = await db
    .update(universities)
    .set({ isValidated: true })
    .where(eq(universities.id, universityId))
    .returning();

  return { id: updated.id, isValidated: updated.isValidated };
}

export async function rejectUniversity(universityId: string): Promise<void> {
  const [uni] = await db.select().from(universities).where(eq(universities.id, universityId));

  if (!uni) {
    const err = new Error('University not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Soft-delete: deactivate the user account (preserves record for audit)
  await db.update(users).set({ deactivatedAt: new Date() }).where(eq(users.id, uni.userId));
}
