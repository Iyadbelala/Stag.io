import { prisma } from '../model/prisma';
import PDFDocument from 'pdfkit';

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
  const apps = await prisma.application.findMany({
    where: { status: 'accepted' },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      offer: { include: { company: { select: { companyName: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return apps.map((a) => ({
    id: a.id,
    studentName: `${a.student.user.firstName ?? ''} ${a.student.user.lastName ?? ''}`.trim() || 'Unknown',
    studentEmail: a.student.user.email,
    offerTitle: a.offer.title,
    companyName: a.offer.company.companyName,
    coverLetter: a.coverLetter,
    cvUrl: a.cvUrl,
    status: a.status,
    appliedAt: a.appliedAt.toISOString(),
  }));
}

/* ──────────────────────────────────────────────
   List all applications (for overview)
   ────────────────────────────────────────────── */
export async function getAllApplications(): Promise<AdminApplication[]> {
  const apps = await prisma.application.findMany({
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      offer: { include: { company: { select: { companyName: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return apps.map((a) => ({
    id: a.id,
    studentName: `${a.student.user.firstName ?? ''} ${a.student.user.lastName ?? ''}`.trim() || 'Unknown',
    studentEmail: a.student.user.email,
    offerTitle: a.offer.title,
    companyName: a.offer.company.companyName,
    coverLetter: a.coverLetter,
    cvUrl: a.cvUrl,
    status: a.status,
    appliedAt: a.appliedAt.toISOString(),
  }));
}

/* ──────────────────────────────────────────────
   Validate an accepted application
   ────────────────────────────────────────────── */
export async function validateApplication(applicationId: string): Promise<{ id: string; status: string }> {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });

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

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'validated' },
  });

  return { id: updated.id, status: updated.status };
}

/* ──────────────────────────────────────────────
   Generate internship agreement PDF
   ────────────────────────────────────────────── */
export async function generateApplicationPdf(applicationId: string): Promise<Buffer> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true, university: true } },
        },
      },
      offer: {
        include: { company: { select: { companyName: true, location: true, contactPerson: true } } },
      },
    },
  });

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

  // Build the PDF in memory
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const studentName = `${app.student.user.firstName ?? ''} ${app.student.user.lastName ?? ''}`.trim() || 'N/A';
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
      const cardH = lines.length * 18 + 16;
      doc.roundedRect(cardX, y, cardW, cardH, 6).fill(cream);
      doc.strokeColor(gold).lineWidth(0.5).roundedRect(cardX, y, cardW, cardH, 6).stroke();
      let ly = y + 10;
      for (const line of lines) {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
        doc.text(line.label, cardX + 12, ly);
        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text(line.value, cardX + 12 + 90, ly);
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
      { label: 'Email:', value: app.student.user.email },
      { label: 'University:', value: app.student.user.university ?? 'N/A' },
    ];
    const companyLines = [
      { label: 'Company:', value: app.offer.company.companyName },
      { label: 'Location:', value: app.offer.company.location ?? 'N/A' },
      { label: 'Contact:', value: app.offer.company.contactPerson ?? 'N/A' },
    ];

    // Card labels
    doc.font('Helvetica-Bold').fontSize(9).fillColor(gold);
    doc.text('▎ THE STUDENT', margin + 6, y);
    doc.text('▎ THE COMPANY', margin + halfW + 20, y);
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
      { label: 'Position:', value: app.offer.title },
      { label: 'Duration:', value: app.offer.duration },
      { label: 'Location:', value: app.offer.location },
      { label: 'Type:', value: app.offer.type.charAt(0).toUpperCase() + app.offer.type.slice(1) },
    ];
    const dh = infoCard(detailLines, margin, contentW);
    y += dh + 12;

    // Description & Requirements in a light box
    doc.roundedRect(margin, y, contentW, 0.1, 4); // just to position
    const descBoxY = y;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
    doc.text('DESCRIPTION', margin + 10, y + 6);
    doc.font('Helvetica').fontSize(9).fillColor('#444');
    doc.text(app.offer.description, margin + 10, y + 18, { width: contentW - 20 });
    y = doc.y + 10;

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(warmBrown);
    doc.text('REQUIREMENTS', margin + 10, y);
    doc.font('Helvetica').fontSize(9).fillColor('#444');
    doc.text(app.offer.requirements, margin + 10, y + 12, { width: contentW - 20 });
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
      { role: 'Company', name: app.offer.company.companyName },
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
