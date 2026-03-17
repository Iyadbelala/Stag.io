import { eq } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import { db } from '../model/db';
import { users, students } from '../model/schema';

/* ──────────────────────────────────────────────
   Generate a professional CV PDF from student profile data
   ────────────────────────────────────────────── */
export async function generateStudentCv(userId: string): Promise<Buffer> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    const err = new Error('User not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  if (!student) {
    const err = new Error('Student profile not found') as Error & { code: string; status: number };
    err.code = 'NOT_FOUND';
    err.status = 404;
    throw err;
  }

  // Fetch profile photo if available
  let photoBuffer: Buffer | null = null;
  if (student.profilePhotoUrl) {
    try {
      const res = await fetch(student.profilePhotoUrl);
      if (res.ok) {
        photoBuffer = Buffer.from(await res.arrayBuffer());
      }
    } catch {
      // Fall back to initials if photo fetch fails
    }
  }

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Student';
    const pageW = 595.28;
    const pageH = 841.89;

    // ── Colors (matching Stag.io brand) ──
    const gold = '#C8A97E';
    const darkBrown = '#3E2723';
    const warmBrown = '#5D4037';
    const cream = '#FDF8F0';
    const lightGold = '#F5ECD7';

    // ═══════════════════════════════════════════
    //  LEFT SIDEBAR (dark brown, 200px wide)
    // ═══════════════════════════════════════════
    const sideW = 195;
    doc.rect(0, 0, sideW, pageH).fill(darkBrown);

    // Gold accent strip at top of sidebar
    doc.rect(0, 0, sideW, 5).fill(gold);

    // ── Profile photo or initials circle ──
    const circleX = sideW / 2;
    const circleY = 75;
    const radius = 38;

    if (photoBuffer) {
      // Draw border ring
      doc.circle(circleX, circleY, radius).fill(gold);
      // Clip to circle and draw the photo
      doc.save();
      doc.circle(circleX, circleY, radius - 3).clip();
      doc.image(photoBuffer, circleX - (radius - 3), circleY - (radius - 3), {
        width: (radius - 3) * 2,
        height: (radius - 3) * 2,
      });
      doc.restore();
    } else {
      doc.circle(circleX, circleY, radius).fill(warmBrown);
      doc.circle(circleX, circleY, radius - 3).fill(gold);
      const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || '?';
      doc.font('Helvetica-Bold').fontSize(22).fillColor(darkBrown);
      doc.text(initials, circleX - 20, circleY - 10, { width: 40, align: 'center' });
    }

    // ── Name under circle ──
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFFFFF');
    doc.text(fullName, 12, 125, { width: sideW - 24, align: 'center' });

    // ── Student label ──
    doc.font('Helvetica').fontSize(9).fillColor(gold);
    doc.text('STUDENT', 12, 148, { width: sideW - 24, align: 'center', characterSpacing: 2 });

    let sideY = 175;

    // ── Sidebar section helper ──
    const sideSection = (title: string) => {
      doc.rect(12, sideY, sideW - 24, 1).fill(gold);
      sideY += 8;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(gold);
      doc.text(title.toUpperCase(), 16, sideY, { width: sideW - 32, characterSpacing: 1.5 });
      sideY += 18;
    };

    // ── CONTACT ──
    sideSection('Contact');

    const contactItems = [
      { label: 'Email', value: user.email },
      { label: 'University', value: user.university ?? 'N/A' },
    ];

    for (const item of contactItems) {
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#CCCCCC');
      doc.text(item.label, 16, sideY, { width: sideW - 32 });
      sideY += 10;
      doc.font('Helvetica').fontSize(8).fillColor('#FFFFFF');
      doc.text(item.value, 16, sideY, { width: sideW - 32 });
      sideY += 16;
    }

    // ── DEPARTMENT ──
    if (student.department) {
      sideY += 6;
      sideSection('Department');
      doc.font('Helvetica').fontSize(8.5).fillColor('#FFFFFF');
      doc.text(student.department, 16, sideY, { width: sideW - 32 });
      sideY += 18;
    }

    // ── SKILLS ──
    if (student.skills.length > 0) {
      sideY += 6;
      sideSection('Skills');

      // Render skills as pill-like items
      for (const skill of student.skills) {
        // Gold dot + skill text
        doc.circle(22, sideY + 4, 2.5).fill(gold);
        doc.font('Helvetica').fontSize(8.5).fillColor('#FFFFFF');
        doc.text(skill, 30, sideY, { width: sideW - 46 });
        sideY += 16;

        // Safety check: don't overflow the page
        if (sideY > pageH - 60) break;
      }
    }

    // ── Sidebar footer — Stag.io branding ──
    doc.font('Helvetica').fontSize(7).fillColor(gold);
    doc.text('Generated with Stag.io', 12, pageH - 30, { width: sideW - 24, align: 'center' });

    // Gold accent strip at bottom of sidebar
    doc.rect(0, pageH - 5, sideW, 5).fill(gold);

    // ═══════════════════════════════════════════
    //  MAIN CONTENT AREA (right side)
    // ═══════════════════════════════════════════
    const mainX = sideW + 30;
    const mainW = pageW - mainX - 40;
    let mainY = 40;

    // ── Header accent line ──
    doc.rect(mainX, mainY, mainW, 3).fill(gold);
    mainY += 15;

    // ── Full Name (large) ──
    doc.font('Helvetica-Bold').fontSize(26).fillColor(darkBrown);
    doc.text(fullName, mainX, mainY, { width: mainW });
    mainY += 36;

    // ── Title / Department ──
    if (student.department) {
      doc.font('Helvetica').fontSize(12).fillColor(warmBrown);
      doc.text(student.department, mainX, mainY, { width: mainW });
      mainY += 22;
    }

    // ── Thin separator ──
    doc.rect(mainX, mainY, mainW, 0.5).fill(lightGold);
    mainY += 18;

    // ── Main section helper ──
    const mainSection = (title: string) => {
      // Gold left bar
      doc.rect(mainX, mainY, 3, 16).fill(gold);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(darkBrown);
      doc.text(title, mainX + 10, mainY + 1, { width: mainW - 10 });
      mainY += 26;
    };

    // ── ABOUT / BIO ──
    if (student.bio) {
      mainSection('About Me');

      doc.font('Helvetica').fontSize(9.5).fillColor('#444444');
      doc.text(student.bio, mainX, mainY, { width: mainW, lineGap: 3 });
      mainY = doc.y + 22;
    }

    // ── EDUCATION ──
    mainSection('Education');

    // Education card
    doc.roundedRect(mainX, mainY, mainW, 55, 4).fill(cream);
    doc.roundedRect(mainX, mainY, mainW, 55, 4).strokeColor(lightGold).lineWidth(0.5).stroke();

    doc.font('Helvetica-Bold').fontSize(10).fillColor(darkBrown);
    doc.text(user.university ?? 'University', mainX + 12, mainY + 10, { width: mainW - 24 });

    if (student.department) {
      doc.font('Helvetica').fontSize(9).fillColor(warmBrown);
      doc.text(student.department, mainX + 12, mainY + 26, { width: mainW - 24 });
    }

    doc.font('Helvetica').fontSize(8).fillColor('#888888');
    doc.text(user.email, mainX + 12, mainY + 40, { width: mainW - 24 });

    mainY += 70;

    // ── SKILLS (visual representation on main side too) ──
    if (student.skills.length > 0) {
      mainSection('Technical Skills');

      // Render skills in a grid-like layout
      let skillX = mainX;
      const skillRowH = 22;

      for (const skill of student.skills) {
        const textW = doc.font('Helvetica').fontSize(8.5).widthOfString(skill);
        const pillW = textW + 18;

        // Wrap to next line if needed
        if (skillX + pillW > mainX + mainW) {
          skillX = mainX;
          mainY += skillRowH;
        }

        // Safety check
        if (mainY > pageH - 80) break;

        // Draw pill
        doc.roundedRect(skillX, mainY, pillW, 17, 8).fill(lightGold);
        doc.font('Helvetica').fontSize(8.5).fillColor(warmBrown);
        doc.text(skill, skillX + 9, mainY + 4, { width: pillW - 18 });

        skillX += pillW + 6;
      }

      mainY += skillRowH + 14;
    }

    // ── PORTFOLIO (mention if they have photos) ──
    if (student.portfolioPhotos.length > 0) {
      if (mainY < pageH - 100) {
        mainSection('Portfolio');
        doc.font('Helvetica').fontSize(9.5).fillColor('#444444');
        doc.text(
          `${student.portfolioPhotos.length} project${student.portfolioPhotos.length > 1 ? 's' : ''} / certificate${student.portfolioPhotos.length > 1 ? 's' : ''} available on Stag.io profile.`,
          mainX, mainY, { width: mainW },
        );
        mainY = doc.y + 20;
      }
    }

    // ═══════════════════════════════════════════
    //  BOTTOM ACCENT (main area)
    // ═══════════════════════════════════════════
    doc.rect(mainX, pageH - 8, mainW, 3).fill(gold);

    doc.end();
  });
}
