import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from './model/db';
import { users, universities, companies, students, internshipOffers } from './model/schema';

/* ─── Wipe ─────────────────────────────────────────── */
async function wipe() {
  console.log('Wiping database...');
  await db.execute(sql`
    TRUNCATE TABLE
      audit_logs, notifications, reviews, applications, saved_offers,
      internship_offers, universities, students, companies, users
    RESTART IDENTITY CASCADE;
  `);
}

/* ─── Data pools ───────────────────────────────────── */
const FIRST_NAMES = [
  'Iyad','Yacine','Karim','Nadia','Lina','Sami','Amine','Sofia','Rania','Mehdi',
  'Selma','Hakim','Adel','Imane','Anis','Sara','Walid','Ines','Reda','Fatima',
  'Bilal','Hadia','Nassim','Lyna','Omar','Yasmine','Tarek','Khadija','Younes','Hiba',
  'Ramy','Souad','Idris','Rym','Faycal','Maroua','Riad','Manel','Khalil','Asma',
  'Anouar','Wassila','Zinedine','Chaima','Bachir','Lamia','Hamza','Nour','Salim','Dounia',
];
const LAST_NAMES = [
  'Belala','Benali','Cherifi','Hamdi','Kaci','Haddad','Rebrab','Benmessaoud','Tayebi',
  'Bekhouche','Bensalem','Khelifati','Khelifa','Aoudia','Bouazza','Mekki','Boukhalfa',
  'Mansouri','Saadi','Ould-Yahia','Lahmar','Zerouki','Ait-Ali','Bouaziz','Toumi',
  'Sadouni','Drici','Yahiaoui','Brahimi','Slimani',
];
const SKILLS_POOL = [
  'React','Node.js','TypeScript','PostgreSQL','Next.js','Tailwind CSS','Python','Java',
  'C++','Go','Docker','Kubernetes','AWS','GCP','Linux','Git','SQL','MongoDB','Redis',
  'GraphQL','REST APIs','Figma','Photoshop','Illustrator','MATLAB','AutoCAD','Revit',
  'Excel','Power BI','TensorFlow','PyTorch','NLP','Cybersecurity','Networking',
];
const DEPARTMENTS = [
  'Computer Science','Software Engineering','Information Systems','Electrical Engineering',
  'Mechanical Engineering','Civil Engineering','Telecommunications','Data Science',
  'Cybersecurity','Industrial Engineering','Business Administration','Marketing','Finance',
];
const CITIES = ['Algiers','Oran','Constantine','Annaba','Bejaia','Setif','Blida','Tlemcen','Batna','Tizi Ouzou'];
const INDUSTRIES = [
  'Telecommunications','Oil & Gas','Electronics','Software & IT','Pharmaceutical',
  'Construction','Insurance','Energy','Automotive','Media & Digital','Banking',
  'E-commerce','Logistics','Food & Manufacturing','Consulting',
];

const COMPANY_NAMES = [
  'Djezzy','Mobilis','Ooredoo Algeria','Sonatrach','Condor Electronics','Cevital',
  'Algerie Telecom','Yassir','Biopharm','Cosider Group','Alliance Assurances','Naftal',
  'Elsecom Group','Starlight Media','TechValley DZ','BNP Paribas El Djazair','CNEP-Banque',
  'SAA Assurances','Saidal','ENIE','SNTA','Tassili Airlines','Air Algerie','SNVI',
  'Algeria Post','BADR Bank','Trust Algeria','Numidis','Hamoud Boualem','NCA-Rouiba',
];

const OFFER_TEMPLATES = [
  { title: 'Full-Stack Developer Intern',  req: 'React, Node.js, TypeScript, SQL, Git' },
  { title: 'Backend Engineer Intern',      req: 'Python, PostgreSQL, Docker, REST APIs' },
  { title: 'Frontend Engineer Intern',     req: 'React, Next.js, Tailwind CSS, TypeScript' },
  { title: 'Data Analyst Intern',          req: 'SQL, Python, Power BI, Excel, Statistics' },
  { title: 'Mobile Developer Intern',      req: 'Flutter, Dart, Firebase, REST APIs' },
  { title: 'Cybersecurity Intern',         req: 'Cybersecurity, Linux, Networking, SIEM' },
  { title: 'DevOps Intern',                req: 'Docker, Kubernetes, CI/CD, Linux, AWS' },
  { title: 'AI/ML Engineer Intern',        req: 'Python, TensorFlow, PyTorch, NLP, SQL' },
  { title: 'UI/UX Designer Intern',        req: 'Figma, User research, Prototyping' },
  { title: 'Marketing Intern',             req: 'Social media, SEO, Copywriting, Analytics' },
  { title: 'Network Engineering Intern',   req: 'TCP/IP, Cisco, Linux, Networking' },
  { title: 'Business Intelligence Intern', req: 'Power BI, SQL, Excel, Data analysis' },
];
const DURATIONS = ['3 months','4 months','6 months'];
const TYPES = ['onsite','hybrid','remote'] as const;

const pick = <T,>(arr: readonly T[], i: number) => arr[i % arr.length];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ─── Seed ─────────────────────────────────────────── */
async function seed() {
  await wipe();
  console.log('Seeding...\n');

  const adminPwHash = await bcrypt.hash('admin123', 10);
  const uniPwHash = await bcrypt.hash('university123', 10);
  const studentPwHash = await bcrypt.hash('student123', 10);
  const companyPwHash = await bcrypt.hash('company123', 10);

  // ── Superadmin ──
  await db.insert(users).values({
    email: 'admin@stag.io', passwordHash: adminPwHash, role: 'superadmin',
    firstName: 'Super', lastName: 'Admin', isEmailVerified: true,
  });

  // ── Admin ──
  await db.insert(users).values({
    email: 'admin-staff@stag.io', passwordHash: adminPwHash, role: 'admin',
    firstName: 'Admin', lastName: 'Staff', isEmailVerified: true,
  });

  // ── University ──
  const [uniUser] = await db.insert(users).values({
    email: 'admin@univ-constantine2.dz', passwordHash: uniPwHash, role: 'university',
    firstName: 'University', lastName: 'Admin', isEmailVerified: true,
  }).returning();
  await db.insert(universities).values({
    userId: uniUser.id,
    universityName: 'Universite Constantine 2',
    domain: 'univ-constantine2.dz',
    website: 'https://univ-constantine2.dz',
    location: 'Constantine',
    description: 'Abdelhamid Mehri University - Constantine 2',
    isValidated: true,
  });

  // ── 50 Students ──
  console.log('Creating 50 students...');
  const studentUsers = await db.insert(users).values(
    Array.from({ length: 50 }, (_, i) => {
      const first = pick(FIRST_NAMES, i);
      const last = pick(LAST_NAMES, i + 7);
      return {
        email: `${slug(first)}.${slug(last)}${i + 1}@univ-constantine2.dz`,
        passwordHash: studentPwHash,
        role: 'student' as const,
        firstName: first,
        lastName: last,
        university: 'univ-constantine2.dz',
        isEmailVerified: true,
      };
    })
  ).returning();

  await db.insert(students).values(
    studentUsers.map((u, i) => ({
      userId: u.id,
      department: pick(DEPARTMENTS, i),
      skills: [pick(SKILLS_POOL, i), pick(SKILLS_POOL, i + 5), pick(SKILLS_POOL, i + 11)],
      bio: `${pick(DEPARTMENTS, i)} student at Constantine 2.`,
    }))
  );

  // ── 30 Companies ──
  console.log('Creating 30 companies...');
  const companyUsers = await db.insert(users).values(
    COMPANY_NAMES.map((name) => ({
      email: `hr@${slug(name)}.dz`,
      passwordHash: companyPwHash,
      role: 'company' as const,
      firstName: 'HR',
      lastName: name.split(' ')[0],
      isEmailVerified: true,
    }))
  ).returning();

  const companyRows = await db.insert(companies).values(
    companyUsers.map((u, i) => ({
      userId: u.id,
      companyName: COMPANY_NAMES[i],
      industry: pick(INDUSTRIES, i),
      website: `https://${slug(COMPANY_NAMES[i])}.dz`,
      location: pick(CITIES, i),
      contactPerson: `${pick(FIRST_NAMES, i + 3)} ${pick(LAST_NAMES, i + 11)}`,
      description: `${COMPANY_NAMES[i]} is a leading Algerian company in the ${pick(INDUSTRIES, i)} sector.`,
      isValidated: true,
    }))
  ).returning();

  // ── 120 Offers (4 per company) ──
  console.log('Creating 120 internship offers...');
  const offers = companyRows.flatMap((comp, ci) =>
    Array.from({ length: 4 }, (_, oi) => {
      const tpl = pick(OFFER_TEMPLATES, ci * 4 + oi);
      return {
        companyId: comp.id,
        title: tpl.title,
        description: `${tpl.title} at ${comp.companyName}. Hands-on experience with real-world projects in a top Algerian company.`,
        requirements: tpl.req,
        duration: pick(DURATIONS, ci + oi),
        location: comp.location ?? 'Algiers',
        type: pick(TYPES, ci + oi),
        status: 'active' as const,
      };
    })
  );
  await db.insert(internshipOffers).values(offers);

  console.log(`\nDone. Created:`);
  console.log(`  1 superadmin, 1 admin, 1 university, 50 students, 30 companies, ${offers.length} offers\n`);

  console.log('Test credentials (one per role):');
  console.log('  Superadmin: admin@stag.io / admin123');
  console.log('  Admin:      admin-staff@stag.io / admin123');
  console.log('  University: admin@univ-constantine2.dz / university123');
  console.log(`  Student:    ${studentUsers[0].email} / student123`);
  console.log(`  Company:    ${companyUsers[0].email} / company123`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
