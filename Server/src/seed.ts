import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './model/db';
import { users, universities, companies, students, internshipOffers } from './model/schema';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Superadmin ──
  const superadminHash = await bcrypt.hash('admin123', 12);
  const [superadmin] = await db.insert(users).values({
    email: 'admin@stag.io',
    passwordHash: superadminHash,
    role: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
  }).returning();
  console.log('✅ Superadmin: admin@stag.io / admin123');

  // ── 2. University user + profile (validated) ──
  const uniHash = await bcrypt.hash('university123', 12);
  const [uniUser] = await db.insert(users).values({
    email: 'admin@univ-constantine2.dz',
    passwordHash: uniHash,
    role: 'university',
    firstName: 'University',
    lastName: 'Admin',
  }).returning();

  await db.insert(universities).values({
    userId: uniUser.id,
    universityName: 'Université Constantine 2',
    domain: 'univ-constantine2.dz',
    website: 'https://univ-constantine2.dz',
    location: 'Constantine',
    description: 'Abdelhamid Mehri University - Constantine 2',
    isValidated: true,
  });
  console.log('✅ University: Université Constantine 2 (domain: univ-constantine2.dz) — validated');

  // ── 3. Student user + profile ──
  const studentHash = await bcrypt.hash('student123', 12);
  const [studentUser] = await db.insert(users).values({
    email: 'iyad@univ-constantine2.dz',
    passwordHash: studentHash,
    role: 'student',
    firstName: 'Iyad',
    lastName: 'Belala',
    university: 'univ-constantine2.dz',
    isEmailVerified: true,
  }).returning();

  await db.insert(students).values({
    userId: studentUser.id,
    department: 'Computer Science',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Next.js', 'Tailwind CSS'],
    bio: 'Full-stack developer passionate about building modern web applications.',
  });
  console.log('✅ Student: iyad@univ-constantine2.dz / student123');

  // ── 4. Company user + profile (validated) ──
  const companyHash = await bcrypt.hash('company123', 12);
  const [companyUser] = await db.insert(users).values({
    email: 'hr@techcorp.dz',
    passwordHash: companyHash,
    role: 'company',
    firstName: 'HR',
    lastName: 'Manager',
  }).returning();

  const [company] = await db.insert(companies).values({
    userId: companyUser.id,
    companyName: 'TechCorp Algeria',
    industry: 'Technology',
    website: 'https://techcorp.dz',
    location: 'Constantine',
    contactPerson: 'Ahmed Bouzid',
    description: 'Leading tech company in Algeria specializing in web and mobile development.',
    isValidated: true,
  }).returning();
  console.log('✅ Company: TechCorp Algeria (hr@techcorp.dz / company123) — validated');

  // ── 5. Second company ──
  const company2Hash = await bcrypt.hash('company123', 12);
  const [company2User] = await db.insert(users).values({
    email: 'contact@designstudio.dz',
    passwordHash: company2Hash,
    role: 'company',
    firstName: 'Contact',
    lastName: 'Person',
  }).returning();

  const [company2] = await db.insert(companies).values({
    userId: company2User.id,
    companyName: 'Design Studio DZ',
    industry: 'Design & Marketing',
    website: 'https://designstudio.dz',
    location: 'Algiers',
    contactPerson: 'Sara Mansouri',
    description: 'Creative agency specializing in UI/UX design, branding, and digital marketing.',
    isValidated: true,
  }).returning();
  console.log('✅ Company: Design Studio DZ (contact@designstudio.dz / company123) — validated');

  // ── 6. Internship offers ──
  await db.insert(internshipOffers).values([
    {
      companyId: company.id,
      title: 'Full-Stack Developer Intern',
      description: 'Join our team to build modern web applications using React, Node.js, and PostgreSQL. You will work on real projects and learn industry best practices.',
      requirements: 'React, Node.js, TypeScript, PostgreSQL, Git',
      duration: '3 months',
      location: 'Constantine',
      type: 'hybrid',
      status: 'active',
    },
    {
      companyId: company.id,
      title: 'Mobile Developer Intern',
      description: 'Develop cross-platform mobile applications using React Native. Collaborate with the design team to deliver pixel-perfect UIs.',
      requirements: 'React Native, JavaScript, Mobile Development, REST APIs',
      duration: '6 months',
      location: 'Constantine',
      type: 'onsite',
      status: 'active',
    },
    {
      companyId: company.id,
      title: 'DevOps Engineering Intern',
      description: 'Help automate our CI/CD pipelines, manage cloud infrastructure on AWS, and improve deployment workflows.',
      requirements: 'Docker, Kubernetes, AWS, CI/CD, Linux, Git',
      duration: '4 months',
      location: 'Remote',
      type: 'remote',
      status: 'active',
    },
    {
      companyId: company2.id,
      title: 'UI/UX Design Intern',
      description: 'Create beautiful user interfaces and conduct user research. Work with Figma and collaborate with developers.',
      requirements: 'Figma, UI/UX Design, Adobe Creative Suite, Prototyping',
      duration: '3 months',
      location: 'Algiers',
      type: 'onsite',
      status: 'active',
    },
    {
      companyId: company2.id,
      title: 'Digital Marketing Intern',
      description: 'Plan and execute digital marketing campaigns. Manage social media accounts and analyze campaign performance.',
      requirements: 'Social Media Marketing, SEO, Content Creation, Analytics, Copywriting',
      duration: '3 months',
      location: 'Algiers',
      type: 'hybrid',
      status: 'active',
    },
  ]);
  console.log('✅ 5 internship offers created');

  console.log('\n🎉 Seed complete! Here are your test accounts:\n');
  console.log('  Superadmin:  admin@stag.io / admin123');
  console.log('  University:  admin@univ-constantine2.dz / university123');
  console.log('  Student:     iyad@univ-constantine2.dz / student123');
  console.log('  Company 1:   hr@techcorp.dz / company123');
  console.log('  Company 2:   contact@designstudio.dz / company123');
  console.log('');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
